import { useState } from "react";
import { useRoute, Link } from "wouter";
import { useModules } from "@/hooks/useModules";
import { useProgress } from "@/hooks/useProgress";
import { ChevronLeft, CheckCircle } from "lucide-react";
import ExerciseForm from "@/components/ExerciseForm";

export default function ModulePage() {
  // Get moduleId from route params
  const [, params] = useRoute<{ moduleId: string }>("/modules/:moduleId");
  const moduleId = params?.moduleId || "";

  // State for active exercise
  const [activeExerciseId, setActiveExerciseId] = useState<string | null>(null);

  // Get module data
  const { getModuleById, isLoadingModules, getExerciseById, getNextExercise } = useModules();
  const module = getModuleById(moduleId);

  // Get progress data
  const { getModuleProgress, isExerciseCompleted } = useProgress();

  // Handle exercise completion
  const handleExerciseComplete = () => {
    if (!activeExerciseId || !module) return;
    
    // Get the next exercise
    const nextExercise = getNextExercise(moduleId, activeExerciseId);
    
    if (nextExercise) {
      // If there's a next exercise, go to it
      setActiveExerciseId(nextExercise.id);
    } else {
      // If no more exercises, go back to module view
      setActiveExerciseId(null);
    }
  };

  if (isLoadingModules || !module) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Link href="/">
            <div className="text-gray-500 hover:text-gray-700 mr-3">
              <ChevronLeft className="h-5 w-5" />
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Loading...</h1>
        </div>
      </div>
    );
  }

  const activeExercise = activeExerciseId 
    ? getExerciseById(moduleId, activeExerciseId) 
    : null;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {!activeExercise ? (
        // Module Overview
        <>
          <div className="flex items-center mb-6">
            <Link href="/">
              <div className="text-gray-500 hover:text-gray-700 mr-3">
                <ChevronLeft className="h-5 w-5" />
              </div>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">{module.title}</h1>
          </div>

          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <p className="text-gray-700 mb-6">{module.description}</p>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Learning Objectives</h3>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                {module.objectives.map((objective, index) => (
                  <li key={index}>{objective}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Key Concepts</h3>
              <dl className="space-y-4">
                {module.concepts.map((concept, index) => (
                  <div key={index}>
                    <dt className="font-medium text-gray-800">{concept.term}</dt>
                    <dd className="mt-1 text-gray-600">{concept.definition}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Exercises</h2>
              <div className="text-sm text-gray-600">
                {getModuleProgress(moduleId).completed}/{module.exercises.length} completed
              </div>
            </div>

            <div className="space-y-4">
              {module.exercises.map((exercise, index) => (
                <div 
                  key={exercise.id}
                  className={`bg-white rounded-lg border shadow-sm p-4 flex justify-between items-center ${
                    isExerciseCompleted(module.id, exercise.id) 
                      ? 'border-green-600' 
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center">
                    <div 
                      className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                        isExerciseCompleted(module.id, exercise.id)
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      <span>{index + 1}</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{exercise.title}</h3>
                      <p className="text-sm text-gray-500">{exercise.description}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setActiveExerciseId(exercise.id)}
                    className={`ml-4 text-sm font-medium focus:outline-none ${
                      isExerciseCompleted(module.id, exercise.id)
                        ? 'text-primary hover:text-primary-700'
                        : 'bg-primary hover:bg-primary-700 text-white px-4 py-2 rounded'
                    }`}
                  >
                    {isExerciseCompleted(module.id, exercise.id) ? 'Review' : 'Start'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        // Exercise View
        <>
          <div className="flex items-center mb-6">
            <button onClick={() => setActiveExerciseId(null)} className="text-gray-500 hover:text-gray-700 mr-3">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">{activeExercise.title}</h1>
            {isExerciseCompleted(moduleId, activeExercise.id) && (
              <CheckCircle className="ml-2 h-5 w-5 text-green-600" />
            )}
          </div>

          <ExerciseForm 
            exercise={activeExercise}
            moduleId={moduleId}
            onComplete={handleExerciseComplete}
          />
        </>
      )}
    </div>
  );
}
