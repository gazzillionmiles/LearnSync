import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserProgress, Module } from "@shared/types";
import api from "@/lib/api";

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
    queryKey: [`/progress/${userId}`],
  });

  // Fetch modules for calculating total exercises
  const { data: modules = [] } = useQuery<Module[]>({
    queryKey: ['/modules'],
  });

  // Mutation for completing exercises
  const completeMutation = useMutation({
    mutationFn: async ({ moduleId, exerciseId }: { moduleId: string; exerciseId: string }) => {
      const response = await api.post('/progress/complete', {
        moduleId,
        exerciseId
      });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate progress query to refetch updated data
      queryClient.invalidateQueries({ queryKey: [`/progress/${userId}`] });
      queryClient.invalidateQueries({ queryKey: ['/leaderboard'] });
    }
  });

  // Get progress for a specific module
  const getModuleProgress = (moduleId: string) => {
    if (!moduleId) {
      return { completed: 0, total: 0 };
    }

    const module = modules?.find(m => m?.id === moduleId);
    const totalExercises = module?.exercises?.length || 0;
    
    if (!progress?.completedExercises) {
      return { completed: 0, total: totalExercises };
    }
    
    const completedExercises = progress.completedExercises.filter(
      ex => ex?.moduleId === moduleId
    );
    
    return {
      completed: completedExercises?.length || 0,
      total: totalExercises
    };
  };

  // Get total points
  const getTotalPoints = () => {
    return progress?.points || 0;
  };

  // Get total completed exercises
  const getTotalCompletedExercises = () => {
    return progress?.completedExercises?.length || 0;
  };

  // Get total exercises across all modules
  const getTotalExercises = () => {
    if (!modules) return 0;
    return modules.reduce((total, module) => {
      if (!module?.exercises) return total;
      return total + module.exercises.length;
    }, 0);
  };

  // Check if a specific exercise is completed
  const isExerciseCompleted = (moduleId: string, exerciseId: string) => {
    if (!progress?.completedExercises || !moduleId || !exerciseId) return false;
    
    return progress.completedExercises.some(
      ex => ex?.moduleId === moduleId && ex?.exerciseId === exerciseId
    );
  };

  // Complete an exercise
  const completeExercise = async (moduleId: string, exerciseId: string) => {
    if (!moduleId || !exerciseId) {
      throw new Error('Module ID and Exercise ID are required');
    }
    await completeMutation.mutateAsync({ moduleId, exerciseId });
  };

  // Get number of completed modules
  const getCompletedModules = () => {
    if (!progress?.completedExercises || !modules?.length) return 0;
    
    return modules.filter(module => {
      if (!module?.id) return false;
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
