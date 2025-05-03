import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ProgressBar from "@/components/ProgressBar";
import { Module } from "@shared/types";
import { useProgress } from "@/hooks/useProgress";
import { Link } from "wouter";

interface ModuleCardProps {
  module: Module;
}

export default function ModuleCard({ module }: ModuleCardProps) {
  const { getModuleProgress } = useProgress();
  const progress = getModuleProgress(module.id);
  const percentComplete = Math.round((progress.completed / progress.total) * 100);

  return (
    <Card className="overflow-hidden border border-gray-100 hover:border-primary-300 transition-colors">
      <CardContent className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2">{module.title}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2">{module.description}</p>
        
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-500">Progress</span>
          <span className="text-sm font-medium">{progress.completed}/{progress.total}</span>
        </div>
        
        <ProgressBar value={percentComplete} className="mb-4" />
        
        <Link href={`/modules/${module.id}`}>
          <Button className="w-full" variant="default">
            {progress.completed > 0 ? 'Continue' : 'Start Learning'}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
