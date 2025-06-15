import { drizzle } from "drizzle-orm/node-postgres";
import pkg from 'pg';
const { Pool } = pkg;
import { userProgress, users, type User, type InsertUser } from "@shared/schema";
import type { UserProgress, ThreeDScene, Challenge, Badge, LeaderboardEntry } from "@shared/types";
import { evaluatePromptWithGroq } from "./services/groqService";
import { eq, sql } from "drizzle-orm";

if (!process.env.DB_URL) {
  throw new Error("DB_URL environment variable is required");
}

const pool = new Pool({
  connectionString: process.env.DB_URL,
});

const db = drizzle(pool);

export { db };

export class ThreeDStorage {
  async saveScene(userId: number, prompt: string, sceneData: ThreeDScene): Promise<string> {
    // Save 3D scene with generated ID
    const sceneId = `scene_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    // Implementation will store in database
    return sceneId;
  }

  async getSceneById(sceneId: string): Promise<ThreeDScene | null> {
    // Retrieve 3D scene from database
    return null; // Placeholder
  }

  async getUserScenes(userId: number): Promise<ThreeDScene[]> {
    // Get all user's saved scenes
    return []; // Placeholder
  }

  async evaluatePrompt3D(userPrompt: string, challengeId: string): Promise<{
    score: number;
    suggestions: string[];
    semanticSimilarity: number;
    sceneGenerated: boolean;
  }> {
    try {
      const challenge = await this.getChallengeById(challengeId);
      if (!challenge) {
        throw new Error("Challenge not found");
      }

      return await evaluatePromptWithGroq(userPrompt, challenge.description, challenge.expectedPrompt);
    } catch (error) {
      console.error("Error evaluating 3D prompt:", error);
      throw error;
    }
  }

  async getChallengeById(challengeId: string): Promise<any> {
    // Import challenges from data file
    const { challenges } = await import("./data/challenges");
    return challenges.find(c => c.id === challengeId) || null;
  }

  async getAllChallenges(): Promise<any[]> {
    const { challenges } = await import("./data/challenges");
    return challenges;
  }

  async getUserProgress(userId: number): Promise<UserProgress> {
    try {
      const result = await db.select().from(userProgress).where(eq(userProgress.userId, userId));

      if (result.length === 0) {
        const newProgress: UserProgress = {
          completedExercises: [],
          points: 0
        };
        return newProgress;
      }

      return result[0].progress as UserProgress;
    } catch (error) {
      console.error("Error getting user progress:", error);
      return { completedExercises: [], points: 0 };
    }
  }

  async updateUserProgress(userId: number, progress: UserProgress): Promise<void> {
    try {
      const existingProgress = await db.select().from(userProgress).where(eq(userProgress.userId, userId));

      if (existingProgress.length === 0) {
        await db.insert(userProgress).values({
          userId,
          progress: progress as any
        });
      } else {
        await db.update(userProgress)
          .set({ progress: progress as any })
          .where(eq(userProgress.userId, userId));
      }
    } catch (error) {
      console.error("Error updating user progress:", error);
      throw error;
    }
  }
}

export const storage = new ThreeDStorage();