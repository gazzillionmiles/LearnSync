import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  className?: string;
}

export default function ProgressBar({ value, className }: ProgressBarProps) {
  return (
    <div className={cn("w-full bg-gray-200 rounded-full h-2", className)}>
      <div 
        className="bg-primary h-2 rounded-full" 
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}
