import { useEffect, useState } from 'react';

const apiGet = async <T>(path: string): Promise<T> => {
  const res = await fetch(`/api${path}`);
  const payload = await res.json();
  if (!res.ok) throw new Error(payload.error ?? res.statusText);
  return payload as T;
};

export const useApi = <T>(path: string | null) => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!path) return;

    let live = true;
    setData(null);
    setError(null);

    apiGet<T>(path)
      .then((payload) => live && setData(payload))
      .catch((err: Error) => live && setError(err.message));

    return () => {
      live = false;
    };
  }, [path]);

  return { data, error, isLoading: !(data || error) && Boolean(path) };
};
