import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import type { UserProgress, Module, Exercise, Feedback } from './types';

// User Table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Progress Table
export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  completedExercises: jsonb("completed_exercises").$type<{ moduleId: string, exerciseId: string, timestamp: number }[]>().notNull().default([]),
  points: integer("points").notNull().default(0),
});

export const insertProgressSchema = createInsertSchema(userProgress).pick({
  userId: true,
  completedExercises: true,
  points: true,
});

// Module Schema (for validation)
export const moduleSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  objectives: z.array(z.string()),
  concepts: z.array(z.object({
    term: z.string(),
    definition: z.string(),
  })),
  exercises: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    problem: z.string(),
    example: z.string(),
    modelAnswer: z.string().optional(),
  })),
});

// Feedback Schema
export const feedbackSchema = z.object({
  score: z.number().min(0).max(10),
  suggestions: z.array(z.string()),
});

// Request Schema for prompt evaluation
export const evaluatePromptSchema = z.object({
  userPrompt: z.string().min(1),
  moduleId: z.string(),
  exerciseId: z.string(),
});

// Request Schema for completing an exercise
export const completeExerciseSchema = z.object({
  userId: z.number(),
  moduleId: z.string(),
  exerciseId: z.string(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertProgress = z.infer<typeof insertProgressSchema>;
export type User = typeof users.$inferSelect;
export type Progress = typeof userProgress.$inferSelect;
export type EvaluatePromptRequest = z.infer<typeof evaluatePromptSchema>;
export type CompleteExerciseRequest = z.infer<typeof completeExerciseSchema>;
