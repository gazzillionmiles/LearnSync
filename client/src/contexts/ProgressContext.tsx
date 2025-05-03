import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserProgress, Module } from "@shared/types";
import { apiRequest } from "@/lib/queryClient";

interface ProgressContextType {
  progress: UserProgress | null;
  isLoading: boolean;
  getModuleProgress: (moduleId: string) => { completed: number; total: number };
  getTotalPoints: () => number;
  getTotalCompletedExercises: () => number;
  getTotalExercises: () => number;
  isExerciseCompleted: (moduleId: string, exerciseId: string) => boolean;
  completeExercise: (moduleId: string, exerciseId: string) => Promise<void>;
  getCompletedModules: () => number;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const userId = 1; // Using a fixed user ID for simplicity
  const queryClient = useQueryClient();

  // Fetch user progress
  const { 
    data: progress, 
    isLoading 
  } = useQuery<UserProgress>({
    queryKey: [`/api/progress/${userId}`],
  });

  // Fetch modules for calculating total exercises
  const { data: modules = [] } = useQuery<Module[]>({
    queryKey: ['/api/modules'],
  });

  // Mutation for completing exercises
  const completeMutation = useMutation({
    mutationFn: async ({ moduleId, exerciseId }: { moduleId: string; exerciseId: string }) => {
      const res = await apiRequest("POST", "/api/progress/complete", {
        userId,
        moduleId,
        exerciseId
      });
      return res.json();
    },
    onSuccess: () => {
      // Invalidate progress query to refetch updated data
      queryClient.invalidateQueries({ queryKey: [`/api/progress/${userId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/leaderboard'] });
    }
  });

  // Get progress for a specific module
  const getModuleProgress = (moduleId: string) => {
    const module = modules.find(m => m.id === moduleId);
    const totalExercises = module?.exercises.length || 0;
    
    if (!progress) {
      return { completed: 0, total: totalExercises };
    }
    
    const completedExercises = progress.completedExercises.filter(
      ex => ex.moduleId === moduleId
    );
    
    return {
      completed: completedExercises.length,
      total: totalExercises
    };
  };

  // Get total points
  const getTotalPoints = () => {
    return progress?.points || 0;
  };

  // Get total completed exercises
  const getTotalCompletedExercises = () => {
    return progress?.completedExercises.length || 0;
  };

  // Get total exercises across all modules
  const getTotalExercises = () => {
    return modules.reduce((total, module) => total + module.exercises.length, 0);
  };

  // Check if a specific exercise is completed
  const isExerciseCompleted = (moduleId: string, exerciseId: string) => {
    if (!progress) return false;
    
    return progress.completedExercises.some(
      ex => ex.moduleId === moduleId && ex.exerciseId === exerciseId
    );
  };

  // Complete an exercise
  const completeExercise = async (moduleId: string, exerciseId: string) => {
    await completeMutation.mutateAsync({ moduleId, exerciseId });
  };

  // Get number of completed modules
  const getCompletedModules = () => {
    if (!progress || modules.length === 0) return 0;
    
    return modules.filter(module => {
      const moduleProgress = getModuleProgress(module.id);
      return moduleProgress.completed === moduleProgress.total;
    }).length;
  };

  const value = {
    progress: progress || null,
    isLoading,
    getModuleProgress,
    getTotalPoints,
    getTotalCompletedExercises,
    getTotalExercises,
    isExerciseCompleted,
    completeExercise,
    getCompletedModules
  };

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    throw new Error("useProgress must be used within a ProgressProvider");
  }
  return context;
}
