import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Exercise } from "@shared/types";
import FeedbackDisplay from "./FeedbackDisplay";
import { Feedback } from "@shared/types";
import { useProgress } from "@/hooks/useProgress";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

interface ExerciseFormProps {
  exercise: Exercise;
  moduleId: string;
  onComplete: () => void;
}

export default function ExerciseForm({ exercise, moduleId, onComplete }: ExerciseFormProps) {
  const [userPrompt, setUserPrompt] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const { isExerciseCompleted, completeExercise } = useProgress();
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!userPrompt.trim() || isEvaluating) return;

    setIsEvaluating(true);
    try {
      const response = await api.post('/evaluate', {
        userPrompt,
        moduleId,
        exerciseId: exercise.id
      });
      
      setFeedback(response.data);
    } catch (error) {
      console.error("Error evaluating prompt:", error);
      toast({
        title: "Evaluation Failed",
        description: "Something went wrong while evaluating your prompt. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleComplete = async () => {
    // Only call the API if the exercise isn't already completed
    if (!isExerciseCompleted(moduleId, exercise.id)) {
      try {
        await completeExercise(moduleId, exercise.id);
        toast({
          title: "Exercise Completed!",
          description: "You've earned 10 points for completing this exercise.",
          variant: "default"
        });
      } catch (error) {
        console.error("Error completing exercise:", error);
        toast({
          title: "Error",
          description: "Failed to save your progress. Please try again.",
          variant: "destructive"
        });
        return;
      }
    }
    
    onComplete();
  };

  const handleTryAgain = () => {
    setFeedback(null);
    setUserPrompt("");
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-sm rounded-lg overflow-hidden mb-6">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Problem</h2>
          <p className="text-gray-700 mb-4">{exercise.problem}</p>

          <div className="bg-gray-50 border border-gray-200 rounded-md p-4 mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Example</h3>
            <div className="bg-white border border-gray-200 rounded-md p-3 font-mono text-sm">
              <pre>{exercise.example}</pre>
            </div>
          </div>

          <h2 className="text-lg font-semibold text-gray-800 mb-2">Your Solution</h2>
          
          <div className="mb-4">
            <Textarea
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              className="h-32 font-mono text-sm"
              placeholder="Type your prompt here..."
              disabled={isEvaluating || !!feedback}
            />
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={isEvaluating || userPrompt.trim() === "" || !!feedback}
              className={feedback ? "hidden" : ""}
            >
              {isEvaluating ? "Evaluating..." : "Submit Solution"}
            </Button>
          </div>
        </div>
      </div>

      {feedback && (
        <FeedbackDisplay 
          feedback={feedback} 
          isCompleted={isExerciseCompleted(moduleId, exercise.id)}
          onComplete={handleComplete}
          onTryAgain={handleTryAgain}
        />
      )}
    </div>
  );
}
