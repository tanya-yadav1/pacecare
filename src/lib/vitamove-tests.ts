import { useCallback, useEffect, useState } from "react";

export type TestScores = {
  motorTap: number | null;
  tremorAmplitude: number | null;
  speech: number | null;
  cognitive: number | null;
};

const KEY = "vitamove-tests";
const EVENT = "vitamove-tests-change";
const empty: TestScores = { motorTap: null, tremorAmplitude: null, speech: null, cognitive: null };

function read(): TestScores {
  if (typeof window === "undefined") return empty;
  try {
    return { ...empty, ...(JSON.parse(localStorage.getItem(KEY) ?? "null") ?? {}) };
  } catch {
    return empty;
  }
}

export function useTestScores() {
  const [scores, setScores] = useState<TestScores>(empty);

  useEffect(() => {
    setScores(read());
    const sync = () => setScores(read());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const save = useCallback((patch: Partial<TestScores>) => {
    const next = { ...read(), ...patch };
    localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(EVENT));
    setScores(next);
  }, []);

  return { scores, save };
}
