import { useQuery } from "@tanstack/react-query";
import { Module, Exercise } from "@shared/types";

export function useModules() {
  // Get all modules
  const { 
    data: modules = [], 
    isLoading: isLoadingModules,
    error: modulesError
  } = useQuery<Module[]>({
    queryKey: ['/api/modules'],
  });

  // Get a specific module by ID
  const getModuleById = (moduleId: string) => {
    return modules.find(module => module.id === moduleId);
  };

  // Get a specific exercise from a module
  const getExerciseById = (moduleId: string, exerciseId: string) => {
    const module = getModuleById(moduleId);
    if (!module) return undefined;
    
    return module.exercises.find(exercise => exercise.id === exerciseId);
  };

  // Get the next exercise in a module after the current one
  const getNextExercise = (moduleId: string, currentExerciseId: string) => {
    const module = getModuleById(moduleId);
    if (!module) return undefined;
    
    const currentIndex = module.exercises.findIndex(ex => ex.id === currentExerciseId);
    if (currentIndex === -1 || currentIndex === module.exercises.length - 1) {
      return undefined;
    }
    
    return module.exercises[currentIndex + 1];
  };

  return {
    modules,
    isLoadingModules,
    modulesError,
    getModuleById,
    getExerciseById,
    getNextExercise
  };
}
