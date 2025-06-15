import { useQuery } from "@tanstack/react-query";
import { Module } from "@shared/types";
import { useProgress } from "@/hooks/useProgress";
import ModuleCard from "@/components/ModuleCard";
import ProgressBar from "@/components/ProgressBar";
import api from "@/lib/api";

export default function Dashboard() {
  const { data: modules = [], isLoading } = useQuery<Module[]>({
    queryKey: ['/modules'],
    queryFn: async () => {
      const response = await api.get<Module[]>('/modules');
      return response.data;
    },
  });

  const { 
    getTotalPoints, 
    getTotalCompletedExercises, 
    getTotalExercises, 
    getCompletedModules 
  } = useProgress();

  const totalPoints = getTotalPoints();
  const completedExercises = getTotalCompletedExercises();
  const totalExercises = getTotalExercises();
  const completedModules = getCompletedModules();
  const percentComplete = totalExercises > 0 
    ? Math.round((completedExercises / totalExercises) * 100)
    : 0;
  
  if (isLoading) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Loading...</h1>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Welcome to PromptMaster AI</h1>
      
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Your Progress</h2>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col md:flex-row justify-between mb-6">
            <div className="mb-4 md:mb-0">
              <p className="text-gray-500 mb-1">Total Points</p>
              <p className="text-3xl font-bold text-primary">{totalPoints}</p>
            </div>
            
            <div className="flex space-x-8">
              <div>
                <p className="text-gray-500 mb-1">Modules</p>
                <p className="text-xl font-semibold">{completedModules}/{modules.length}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Exercises</p>
                <p className="text-xl font-semibold">{completedExercises}/{totalExercises}</p>
              </div>
            </div>
          </div>

          <ProgressBar value={percentComplete} className="mb-2" />
          <div className="text-sm text-gray-500 text-right">{percentComplete}% complete</div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Learning Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map(module => (
            <ModuleCard key={module.id} module={module} />
          ))}
        </div>
      </div>
    </div>
  );
}
