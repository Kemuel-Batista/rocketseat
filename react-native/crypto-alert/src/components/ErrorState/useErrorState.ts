interface UseErrorStateProps {
  onRetry?: () => void;
}

export function useErrorState({ onRetry }: UseErrorStateProps) {
  const handleRetry = () => {
    onRetry?.();
  };
  return { handleRetry, showRetry: Boolean(onRetry) };
}
