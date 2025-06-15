
// 3D Scene Types
export interface ThreeDScene {
  id: string;
  userId: number;
  prompt: string;
  sceneData: {
    geometry: string; // 'cube', 'sphere', 'plane', etc.
    material: {
      color: string;
      texture?: string;
      metalness?: number;
      roughness?: number;
    };
    lighting: {
      ambient: { intensity: number; color: string };
      directional: { intensity: number; color: string; position: [number, number, number] };
    };
    camera: {
      position: [number, number, number];
      rotation: [number, number, number];
    };
    animation?: {
      type: 'rotate' | 'bounce' | 'float';
      speed: number;
    };
    particles?: {
      count: number;
      type: string;
      color: string;
    };
  };
  createdAt: Date;
  isPublic: boolean;
  likes: number;
}

// Challenge Types (replacing old modules)
export interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'bronze' | 'silver' | 'gold';
  category: 'geometry' | 'lighting' | 'animation' | 'materials' | 'particles';
  expectedPrompt: string;
  sceneTemplate: Partial<ThreeDScene['sceneData']>;
  successCriteria: {
    minScore: number;
    requiredElements: string[];
  };
  hints: string[];
  estimatedTime: number; // in minutes
}

// Badge System
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  requirements: {
    challengesCompleted?: number;
    specificChallenges?: string[];
    minScore?: number;
    streakDays?: number;
  };
}

// Mission/Quest System
export interface Mission {
  id: string;
  title: string;
  description: string;
  challenges: string[]; // Challenge IDs
  rewards: {
    points: number;
    badges: string[];
  };
  isActive: boolean;
  timeLimit?: number; // in hours
}

// User Progress Types
export interface CompletedChallenge {
  challengeId: string;
  score: number;
  attempts: number;
  bestPrompt: string;
  sceneId?: string;
  timestamp: number;
}

export interface UserProgress {
  completedExercises: CompletedChallenge[]; // Renamed but keeping for compatibility
  points: number;
  badges: string[];
  currentMission?: string;
  streak: number;
  lastActiveDate: Date;
  level: number;
  preferences: {
    theme: 'light' | 'dark';
    autoSave: boolean;
    showHints: boolean;
  };
}

// Feedback Type (Enhanced for 3D)
export interface Feedback {
  score: number;
  suggestions: string[];
  semanticSimilarity?: number;
  sceneAnalysis?: {
    geometryMatch: boolean;
    colorAccuracy: number;
    lightingQuality: number;
    overallComposition: number;
  };
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
  completedChallenges: number;
  level: number;
  badges: string[];
}

// Collaborative Features
export interface CollaborativeSession {
  id: string;
  hostUserId: number;
  participants: number[];
  sceneId: string;
  isActive: boolean;
  createdAt: Date;
}

export interface Comment {
  id: string;
  userId: number;
  username: string;
  sceneId: string;
  content: string;
  position?: [number, number]; // 2D position on canvas for annotation
  timestamp: Date;
}

// Analytics Types
export interface PromptMetrics {
  totalPrompts: number;
  successRate: number;
  averageScore: number;
  mostUsedKeywords: { word: string; count: number }[];
  averageResponseTime: number;
}
