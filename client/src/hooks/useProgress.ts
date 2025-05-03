import { useProgress as useProgressContext } from "@/contexts/ProgressContext";

// This hook is just a re-export of the context hook
// but could be extended with additional functionality in the future
export function useProgress() {
  return useProgressContext();
}
