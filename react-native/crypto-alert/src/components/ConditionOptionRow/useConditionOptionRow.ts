import { useCallback } from "react";

interface UseConditionOptionRowProps {
  value: "above" | "below";
  onSelect: (value: "above" | "below") => void;
}

export function useConditionOptionRow({ value, onSelect }: UseConditionOptionRowProps) {
  const handlePress = useCallback(() => {
    onSelect(value);
  }, [onSelect, value]);
  return { handlePress };
}
