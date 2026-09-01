import { useCallback, useMemo, useState } from "react";

export interface SelectOption {
  value: string;
  title: string;
  subtitle?: string;
}

interface UseSelectFieldProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
}

export function useSelectField({ options, value, onChange }: UseSelectFieldProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const open = useCallback(() => setModalVisible(true), []);
  const close = useCallback(() => setModalVisible(false), []);

  const selected = useMemo(
    () => options.find((o) => o.value === value),
    [options, value],
  );

  const displayLabel = selected
    ? selected.subtitle
      ? `${selected.title} (${selected.subtitle})`
      : selected.title
    : "";

  const selectItem = useCallback(
    (v: string) => {
      onChange(v);
      setModalVisible(false);
    },
    [onChange],
  );

  return {
    modalVisible,
    open,
    close,
    displayLabel,
    selected,
    selectItem,
  };
}
