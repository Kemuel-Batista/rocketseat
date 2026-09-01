import { useCallback } from "react";

interface UsePrimaryButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

export function usePrimaryButton({ onPress, disabled }: UsePrimaryButtonProps) {
  const handlePress = useCallback(() => {
    if (!disabled) onPress();
  }, [disabled, onPress]);
  return { handlePress };
}
