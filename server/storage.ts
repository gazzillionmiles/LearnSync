
import { drizzle } from "drizzle-orm/node-postgres";
import pkg from 'pg';
const { Pool } = pkg;
import { userProgress, users, type User, type InsertUser } from "@shared/schema";
import type { UserProgress, Module, Exercise, Feedback, LeaderboardEntry } from "@shared/types";
import { evaluatePromptWithGroq } from "./services/groqService";
import { eq, sql } from "drizzle-orm";

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
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;

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

export class DbStorage implements IStorage {
  
  async getUser(userId: number): Promise<User | undefined> {
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
    try {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.username, username))
        .limit(1);
      
      return result[0] || undefined;
    } catch (error) {
      console.error("Error fetching user by username:", error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
      
      return result[0] || undefined;
    } catch (error) {
      console.error("Error fetching user by email:", error);
      return undefined;
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    try {
      const result = await db
        .insert(users)
        .values({
          email: user.email,
          password: user.password,
          username: user.username,
          isVerified: false,
        })
        .returning();

      const newUser = result[0];

      // Initialize user progress
      await db.insert(userProgress).values({
        userId: newUser.id,
        completedExercises: [],
        points: 0,
      });

      return newUser;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    try {
      const result = await db
        .update(users)
        .set(updates)
        .where(eq(users.id, id))
        .returning();
      
      return result[0] || undefined;
    } catch (error) {
      console.error("Error updating user:", error);
      return undefined;
    }
  }

  async getUserProgress(userId: number): Promise<UserProgress> {
    try {
      const result = await db
        .select()
        .from(userProgress)
        .where(eq(userProgress.userId, userId))
        .limit(1);

      if (result.length === 0) {
        // Create initial progress if it doesn't exist
        const newProgress = await db
          .insert(userProgress)
          .values({
            userId: userId,
            completedExercises: [],
            points: 0,
          })
          .returning();
        
        return {
          completedExercises: newProgress[0].completedExercises,
          points: newProgress[0].points,
        };
      }

      return {
        completedExercises: result[0].completedExercises,
        points: result[0].points,
      };
    } catch (error) {
      console.error("Error fetching user progress:", error);
      return { completedExercises: [], points: 0 };
    }
  }

  async completeExercise(userId: number, moduleId: string, exerciseId: string): Promise<UserProgress> {
    try {
      const currentProgress = await this.getUserProgress(userId);
      
      // Check if exercise is already completed
      const alreadyCompleted = currentProgress.completedExercises.some(
        ex => ex.moduleId === moduleId && ex.exerciseId === exerciseId
      );

      if (alreadyCompleted) {
        return currentProgress;
      }

      // Add new completed exercise
      const newCompletedExercise = {
        moduleId,
        exerciseId,
        timestamp: Date.now(),
      };

      const updatedExercises = [...currentProgress.completedExercises, newCompletedExercise];
      const newPoints = currentProgress.points + 10; // Award 10 points per exercise

      // Update in database
      await db
        .update(userProgress)
        .set({
          completedExercises: updatedExercises,
          points: newPoints,
        })
        .where(eq(userProgress.userId, userId));

      return {
        completedExercises: updatedExercises,
        points: newPoints,
      };
    } catch (error) {
      console.error("Error completing exercise:", error);
      throw error;
    }
  }

  async getAllModules(): Promise<Module[]> {
    try {
      // Query modules with their exercises
      const modulesResult = await db.execute(sql`
        SELECT 
          m.id,
          m.title,
          m.description,
          m.objectives,
          m.concepts,
          COALESCE(
            json_agg(
              json_build_object(
                'id', e.id,
                'title', e.title,
                'description', e.description,
                'problem', e.problem,
                'example', e.example,
                'modelAnswer', e.model_answer
              ) ORDER BY e.created_at
            ) FILTER (WHERE e.id IS NOT NULL),
            '[]'::json
          ) as exercises
        FROM modules m
        LEFT JOIN exercises e ON m.id = e.module_id
        GROUP BY m.id, m.title, m.description, m.objectives, m.concepts
        ORDER BY m.created_at
      `);

      return modulesResult.rows.map((row: any) => ({
        id: row.id,
        title: row.title,
        description: row.description,
        objectives: row.objectives,
        concepts: row.concepts,
        exercises: row.exercises,
      }));
    } catch (error) {
      console.error("Error fetching modules:", error);
      return [];
    }
  }

  async getModuleById(moduleId: string): Promise<Module | undefined> {
    try {
      const result = await db.execute(sql`
        SELECT 
          m.id,
          m.title,
          m.description,
          m.objectives,
          m.concepts,
          COALESCE(
            json_agg(
              json_build_object(
                'id', e.id,
                'title', e.title,
                'description', e.description,
                'problem', e.problem,
                'example', e.example,
                'modelAnswer', e.model_answer
              ) ORDER BY e.created_at
            ) FILTER (WHERE e.id IS NOT NULL),
            '[]'::json
          ) as exercises
        FROM modules m
        LEFT JOIN exercises e ON m.id = e.module_id
        WHERE m.id = ${moduleId}
        GROUP BY m.id, m.title, m.description, m.objectives, m.concepts
      `);

      if (result.rows.length === 0) {
        return undefined;
      }

      const row = result.rows[0] as any;
      return {
        id: row.id,
        title: row.title,
        description: row.description,
        objectives: row.objectives,
        concepts: row.concepts,
        exercises: row.exercises,
      };
    } catch (error) {
      console.error("Error fetching module:", error);
      return undefined;
    }
  }

  async getExerciseById(moduleId: string, exerciseId: string): Promise<Exercise | undefined> {
    try {
      const result = await db.execute(sql`
        SELECT 
          e.id,
          e.title,
          e.description,
          e.problem,
          e.example,
          e.model_answer as "modelAnswer"
        FROM exercises e
        WHERE e.module_id = ${moduleId} AND e.id = ${exerciseId}
        LIMIT 1
      `);

      return result.rows[0] as Exercise || undefined;
    } catch (error) {
      console.error("Error fetching exercise:", error);
      return undefined;
    }
  }

  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    try {
      const result = await db.execute(sql`
        SELECT 
          u.id as "userId",
          u.username,
          up.points,
          jsonb_array_length(up.completed_exercises) as "completedExercises"
        FROM users u
        JOIN user_progress up ON u.id = up.user_id
        WHERE up.points > 0
        ORDER BY up.points DESC, jsonb_array_length(up.completed_exercises) DESC
        LIMIT 10
      `);

      return result.rows.map((row: any) => ({
        userId: row.userId,
        username: row.username,
        points: row.points,
        completedExercises: row.completedExercises || 0,
      }));
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      return [];
    }
  }

  async evaluatePrompt(userPrompt: string, moduleId: string, exerciseId: string): Promise<Feedback> {
    try {
      const exercise = await this.getExerciseById(moduleId, exerciseId);
      if (!exercise) {
        throw new Error("Exercise not found");
      }

      return await evaluatePromptWithGroq(userPrompt, exercise.problem, exercise.modelAnswer);
    } catch (error) {
      console.error("Error evaluating prompt:", error);
      throw error;
    }
  }
}

// Create the storage instance
export const storage = new DbStorage();
