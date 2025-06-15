// This file contains shared types used by both the client and server

// Module Structure Types
export interface Concept {
  term: string;
  definition: string;
}

export interface Exercise {
  id: string;
  title: string;
  description: string;
  problem: string;
  example: string;
  modelAnswer?: string;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  objectives: string[];
  concepts: Concept[];
  exercises: Exercise[];
}

// User Progress Types
export interface CompletedExercise {
  moduleId: string;
  exerciseId: string;
  timestamp: number;
}

export interface UserProgress {
  completedExercises: CompletedExercise[];
  points: number;
}

// Feedback Type
export interface Feedback {
  score: number;
  suggestions: string[];
}

// User Type
export interface User {
  id: number;
  email: string;
  username: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Auth Response Type
export interface AuthResponse {
  user: User;
  token: string;
}

// Leaderboard Entry Type
export interface LeaderboardEntry {
  userId: number;
  username: string;
  points: number;
  completedExercises: number;
}
