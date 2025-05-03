import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle } from "lucide-react";
import { Feedback } from "@shared/types";

interface FeedbackDisplayProps {
  feedback: Feedback;
  isCompleted: boolean;
  onComplete: () => void;
  onTryAgain: () => void;
}

export default function FeedbackDisplay({ 
  feedback, 
  isCompleted, 
  onComplete, 
  onTryAgain 
}: FeedbackDisplayProps) {
  const isPassing = feedback.score >= 7;
  
  // Helper to determine score color
  const getScoreColorClass = (score: number) => {
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-amber-500";
    return "text-red-500";
  };

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Feedback</h2>
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-700 mr-2">Score:</span>
            <span className={`text-lg font-bold ${getScoreColorClass(feedback.score)}`}>
              {feedback.score}/10
            </span>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Suggestions</h3>
          <ul className="list-disc pl-5 space-y-1 text-gray-700">
            {feedback.suggestions.map((suggestion, index) => (
              <li key={index}>{suggestion}</li>
            ))}
          </ul>
        </div>

        {isPassing && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md flex items-start">
            <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
            <div>
              <p className="font-medium text-green-800">Well done! You've mastered this exercise.</p>
              <p className="text-sm text-green-700">You've earned 10 points for completing this exercise.</p>
            </div>
          </div>
        )}

        {!isPassing && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md flex items-start">
            <AlertCircle className="h-5 w-5 text-yellow-500 mr-3 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-800">Good effort, but you can do better!</p>
              <p className="text-sm text-yellow-700">Try applying the suggestions and resubmit your solution.</p>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          {isPassing ? (
            <Button
              onClick={onComplete}
              className="bg-green-600 hover:bg-green-700"
            >
              {isCompleted ? "Return to Module" : "Continue to Next Exercise"}
            </Button>
          ) : (
            <Button onClick={onTryAgain}>
              Try Again
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
