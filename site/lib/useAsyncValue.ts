import {useCallback, useEffect, useState} from "react";

export function useAsyncValue<T>(call: () => Promise<T>, deps?: any): [T, {
  loading: boolean,
  reload: () => void
}] {
  const [loading, setLoading] = useState(true);
  const [value, setValue] = useState<T|undefined>(undefined);

  // recreate callback when deps change
  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const result = await call();
      setValue(result);
    } finally {
      setLoading(false)
    }
  }, deps ?? []);

  // when there is a new callback, run it once
  useEffect(() => {
    reload();
  }, [reload]);

  return [value, {loading, reload}];
}