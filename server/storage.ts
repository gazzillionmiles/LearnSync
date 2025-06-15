import { drizzle } from "drizzle-orm/node-postgres";
import pkg from 'pg';
const { Pool } = pkg;
import { userProgress, users, type User, type InsertUser } from "@shared/schema";
import type { UserProgress, Module, Exercise, Feedback, LeaderboardEntry } from "@shared/types";
import { modules } from "./data/modules";

// Modules data
import { evaluatePromptWithGroq } from "./services/groqService";
import { eq } from "drizzle-orm";

if (!process.env.DB_URL) {
  throw new Error("DB_URL environment variable is required");
}

const pool = new Pool({
  connectionString: process.env.DB_URL,
});

export const db = drizzle(pool);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Progress methods
  getUserProgress(userId: number): Promise<UserProgress>;
  completeExercise(userId: number, moduleId: string, exerciseId: string): Promise<UserProgress>;

  // Module methods
  getAllModules(): Promise<Module[]>;
  getModuleById(moduleId: string): Promise<Module | undefined>;
  getExerciseById(moduleId: string, exerciseId: string): Promise<Exercise | undefined>;

  // Leaderboard
  getLeaderboard(): Promise<LeaderboardEntry[]>;

  // Feedback
  evaluatePrompt(userPrompt: string, moduleId: string, exerciseId: string): Promise<Feedback>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private progress: Map<number, UserProgress>;
  private modules: Module[];
  currentId: number;

  constructor() {
    this.users = new Map();
    this.progress = new Map();
    this.modules = modules;
    this.currentId = 1;

    // Add a test user
    this.createUser({ 
      username: "testuser", 
      password: "password",
      email: "test@example.com"
    });
  }

  async getUser(userId: number) {
    try {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      return result[0] || undefined;
    } catch (error) {
      console.error("Error fetching user:", error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { 
      ...insertUser, 
      id,
      isVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      resetToken: null,
      resetTokenExpiry: null
    };
    this.users.set(id, user);

    // Initialize user progress
    this.progress.set(id, {
      completedExercises: [],
      points: 0
    });

    return user;
  }

  async getUserProgress(userId: number): Promise<UserProgress> {
    let userProgress = this.progress.get(userId);

    if (!userProgress) {
      userProgress = { completedExercises: [], points: 0 };
      this.progress.set(userId, userProgress);
    }

    return userProgress;
  }

  async completeExercise(userId: number, moduleId: string, exerciseId: string): Promise<UserProgress> {
    const userProgress = await this.getUserProgress(userId);

    // Check if already completed
    const alreadyCompleted = userProgress.completedExercises.some(
      ex => ex.moduleId === moduleId && ex.exerciseId === exerciseId
    );

    // Add to completed exercises if not already completed
    if (!alreadyCompleted) {
      userProgress.completedExercises.push({
        moduleId,
        exerciseId,
        timestamp: Date.now()
      });

      // Add points for completing exercise (10 points per exercise)
      userProgress.points += 10;

      // Update the progress map
      this.progress.set(userId, userProgress);
    }

    return userProgress;
  }

  async getAllModules(): Promise<Module[]> {
    return this.modules;
  }

  async getModuleById(moduleId: string): Promise<Module | undefined> {
    return this.modules.find(module => module.id === moduleId);
  }

  async getExerciseById(moduleId: string, exerciseId: string): Promise<Exercise | undefined> {
    const module = await this.getModuleById(moduleId);
    if (!module) return undefined;

    return module.exercises.find(exercise => exercise.id === exerciseId);
  }

  async getLeaderboard() {
    // Mock leaderboard data for now
    return [
      { userId: 1, username: "alice", points: 250, completedExercises: 5 },
      { userId: 2, username: "bob", points: 180, completedExercises: 3 },
      { userId: 3, username: "charlie", points: 120, completedExercises: 2 },
    ];
  }

  async evaluatePrompt(userPrompt: string, moduleId: string, exerciseId: string): Promise<Feedback> {
    // Get module and exercise
    const exercise = await this.getExerciseById(moduleId, exerciseId);

    if (!exercise) {
      return {
        score: 0,
        suggestions: ["Exercise not found"]
      };
    }

    try {
      // Use Groq for evaluation
      console.log(`Evaluating prompt with Groq for module: ${moduleId}, exercise: ${exerciseId}`);

      const feedback = await evaluatePromptWithGroq(
        userPrompt,
        exercise.problem,
        exercise.example,
        exercise.modelAnswer
      );

      if (!feedback) {
        throw new Error("No feedback received from Groq");
      }

      return feedback;
    } catch (error) {
      console.error("Error during Groq evaluation:", error);

      // Return a clear error message to the user
      return {
        score: 0,
        suggestions: [
          "Unable to evaluate your prompt at this time.",
          "Please check your internet connection and try again.",
          "If the problem persists, contact support."
        ]
      };
    }
  }
}

// Helper function to check for keyword matches
function checkKeywordMatch(userPrompt: string, problem: string): boolean {
  const promptLower = userPrompt.toLowerCase();
  const problemWords = problem.toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 5) // Only consider significant words
    .slice(0, 5); // Take up to 5 significant words

  return problemWords.some(word => promptLower.includes(word));
}

// Helper function to check for pattern matches
function checkPatternMatch(userPrompt: string, example: string): boolean {
  const promptStructure = getTextStructure(userPrompt);
  const exampleStructure = getTextStructure(example);

  return promptStructure.some(s => exampleStructure.includes(s));
}

// Helper to identify text structure patterns
function getTextStructure(text: string): string[] {
  const patterns: string[] = [];

  // Check for numbered list
  if (/\d+\.\s/.test(text)) {
    patterns.push("numbered-list");
  }

  // Check for bullet points
  if (/•|\*|-\s/.test(text)) {
    patterns.push("bullet-points");
  }

  // Check for sections/headings
  if (/[A-Z][^.!?]*:/.test(text)) {
    patterns.push("section-headers");
  }

  // Check for question format
  if (/\?/.test(text)) {
    patterns.push("questions");
  }

  // Check for command/instruction format
  if (/^(write|create|generate|list|explain|analyze)/i.test(text)) {
    patterns.push("command");
  }

  return patterns.length ? patterns : ["plain-text"];
}

export const storage = new MemStorage();