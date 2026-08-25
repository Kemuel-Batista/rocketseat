import { useEffect, useState } from "react";

export const useDebounce = <T>(value: T, delay: number = 500) => {
  const [deboundedValue, setDeboundedValue] = useState<T>(value);

  useEffect(() => {
    const timeoutId = setInterval(() => {
      setDeboundedValue(value);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [value, delay]);

  return deboundedValue;
};
