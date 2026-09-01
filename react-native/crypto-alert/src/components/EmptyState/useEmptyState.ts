import { useId } from "react";

export function useEmptyState() {
  const titleId = useId();
  return { titleId };
}
