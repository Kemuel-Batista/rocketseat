import type { PriceAlert } from "@context/AlertProvider/useAlertProvider";

interface UseAlertCardProps {
  alert: PriceAlert;
  onDelete: (id: string) => void;
}

export function useAlertCard({ alert, onDelete }: UseAlertCardProps) {
  const isAbove = alert.condition === "above";
  const handleDelete = () => onDelete(alert.id);
  return { isAbove, handleDelete };
}
