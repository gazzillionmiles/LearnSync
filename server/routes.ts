import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { evaluatePromptSchema, completeExerciseSchema, registerSchema, loginSchema, resetPasswordSchema, forgotPasswordSchema } from "@shared/schema";
import { ZodError } from "zod";
import { AuthService } from "./services/authService";
import { authenticateToken, optionalAuth, type AuthRequest } from "./middleware/auth";

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

  // Auth Routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, username } = registerSchema.parse(req.body);

      // Check if user already exists
      const existingUserByUsername = await storage.getUserByUsername(username);
      const existingUserByEmail = await storage.getUserByEmail(email);

      if (existingUserByUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }

      if (existingUserByEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const result = await AuthService.register({ email, password, username });
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: "Validation error",
          errors: error.errors
        });
      }

      const message = error instanceof Error ? error.message : "Registration failed";
      res.status(400).json({ message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const data = loginSchema.parse(req.body);
      const result = await AuthService.login(data);
      res.json(result);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: "Validation error",
          errors: error.errors
        });
      }

      const message = error instanceof Error ? error.message : "Login failed";
      res.status(401).json({ message });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(403).json({ message: "Not authenticated" });
      }

      const user = await AuthService.getUserById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(user);
    } catch (error) {
      console.error("Get user profile error:", error);
      res.status(500).json({ message: "Failed to get user profile" });
    }
  });

  // Modules are now hardcoded in frontend, no API endpoints needed

  // Get user progress (authenticated)
  app.get("/api/progress", authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(403).json({ message: "Not authenticated" });
      }

      const progress = await storage.getUserProgress(req.user.id);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching user progress:", error);
      res.status(500).json({ message: "Failed to fetch user progress" });
    }
  });

  // Complete an exercise (authenticated)
  app.post("/api/progress/complete", authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(403).json({ message: "Not authenticated" });
      }
      console.log(135, req.body);
      const data = completeExerciseSchema.parse(req.body);
      const progress = await storage.completeExercise(
        req.user.id,
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

  // Forgot password
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const data = forgotPasswordSchema.parse(req.body);
      const result = await AuthService.forgotPassword(data.email);
      res.json(result);
    } catch (error) {
      handleZodError(error, res);
    }
  });

  // Reset password
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const data = resetPasswordSchema.parse(req.body);
      const result = await AuthService.resetPassword(data.token, data.password);
      res.json(result);
    } catch (error) {
      handleZodError(error, res);
    }
  });

  // 3D Lab Routes
  app.get("/api/3d/challenges", authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(403).json({ message: "Not authenticated" });
      }
      const challenges = await storage.getAllChallenges();
      res.json(challenges);
    } catch (error) {
      console.error("Error fetching 3D challenges:", error);
      res.status(500).json({ message: "Failed to fetch challenges" });
    }
  });

  app.post("/api/3d/generate-scene", authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(403).json({ message: "Not authenticated" });
      }
      
      const { prompt, challengeId } = req.body;
      const result = await storage.evaluatePrompt3D(prompt, challengeId);
      res.json(result);
    } catch (error) {
      console.error("Error generating 3D scene:", error);
      res.status(500).json({ message: "Failed to generate scene" });
    }
  });

  app.post("/api/3d/save-scene", authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(403).json({ message: "Not authenticated" });
      }
      
      const { prompt, sceneData, title } = req.body;
      const sceneId = await storage.saveScene(req.user.id, prompt, { ...sceneData, title });
      res.json({ sceneId, message: "Scene saved successfully" });
    } catch (error) {
      console.error("Error saving 3D scene:", error);
      res.status(500).json({ message: "Failed to save scene" });
    }
  });

  app.get("/api/3d/scenes", authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(403).json({ message: "Not authenticated" });
      }
      
      const scenes = await storage.getUserScenes(req.user.id);
      res.json(scenes);
    } catch (error) {
      console.error("Error fetching user scenes:", error);
      res.status(500).json({ message: "Failed to fetch scenes" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}