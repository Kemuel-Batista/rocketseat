interface UseLoadingStateProps {
  message?: string;
}

export function useLoadingState({ message }: UseLoadingStateProps) {
  return { displayMessage: message ?? "Loading..." };
}
