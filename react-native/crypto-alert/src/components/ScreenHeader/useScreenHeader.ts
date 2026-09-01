import { useCallback } from "react";

interface UseScreenHeaderProps {
  onBack?: () => void;
}

export function useScreenHeader({ onBack }: UseScreenHeaderProps) {
  const handleBack = useCallback(() => {
    onBack?.();
  }, [onBack]);
  return { handleBack, showBack: Boolean(onBack) };
}
