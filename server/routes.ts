import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { evaluatePromptSchema, completeExerciseSchema } from "@shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Error handling middleware for zod validation errors
  const handleZodError = (error: unknown, res: Response) => {
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors
      });
    }
    
    console.error("Unexpected error:", error);
    return res.status(500).json({
      message: "Internal server error"
    });
  };

  // Get all modules
  app.get("/api/modules", async (_req, res) => {
    try {
      const modules = await storage.getAllModules();
      res.json(modules);
    } catch (error) {
      console.error("Error fetching modules:", error);
      res.status(500).json({ message: "Failed to fetch modules" });
    }
  });

  // Get a specific module by ID
  app.get("/api/modules/:moduleId", async (req, res) => {
    try {
      const moduleId = req.params.moduleId;
      const module = await storage.getModuleById(moduleId);
      
      if (!module) {
        return res.status(404).json({ message: "Module not found" });
      }
      
      res.json(module);
    } catch (error) {
      console.error("Error fetching module:", error);
      res.status(500).json({ message: "Failed to fetch module" });
    }
  });

  // Get user progress
  app.get("/api/progress/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const progress = await storage.getUserProgress(userId);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching user progress:", error);
      res.status(500).json({ message: "Failed to fetch user progress" });
    }
  });

  // Complete an exercise
  app.post("/api/progress/complete", async (req, res) => {
    try {
      const data = completeExerciseSchema.parse(req.body);
      const progress = await storage.completeExercise(
        data.userId,
        data.moduleId,
        data.exerciseId
      );
      
      res.json(progress);
    } catch (error) {
      handleZodError(error, res);
    }
  });

  // Evaluate a prompt
  app.post("/api/evaluate", async (req, res) => {
    try {
      const data = evaluatePromptSchema.parse(req.body);
      const feedback = await storage.evaluatePrompt(
        data.userPrompt,
        data.moduleId,
        data.exerciseId
      );
      
      res.json(feedback);
    } catch (error) {
      handleZodError(error, res);
    }
  });

  // Get leaderboard
  app.get("/api/leaderboard", async (_req, res) => {
    try {
      const leaderboard = await storage.getLeaderboard();
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  // Get users (for testing)
  app.get("/api/users", async (_req, res) => {
    try {
      const users = [];
      for (let i = 1; i <= 5; i++) {
        const user = await storage.getUser(i);
        if (user) users.push(user);
      }
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
