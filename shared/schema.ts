import { pgTable, text, integer, timestamp, jsonb, serial, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import type { UserProgress, Module, Exercise, Feedback } from './types';

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  username: text("username").notNull().unique(),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  resetToken: text("reset_token"),
  resetTokenExpiry: timestamp("reset_token_expiry"),
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
  moduleId: z.string(),
  exerciseId: z.string()
});

// Auth schemas
export const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be less than 20 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export type InsertUser = z.infer<typeof registerSchema>;
export type User = typeof users.$inferSelect;
export type Progress = typeof userProgress.$inferSelect;
export type EvaluatePromptRequest = z.infer<typeof evaluatePromptSchema>;
export type CompleteExerciseRequest = z.infer<typeof completeExerciseSchema>;

// Password reset schemas
export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email format"),
});

export const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;