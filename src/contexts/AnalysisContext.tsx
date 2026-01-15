"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { AnalysisResults } from "@/types/analysis";

const STORAGE_KEY = "analysisResults";

interface AnalysisContextValue {
  results: AnalysisResults | null;
  setResults: (value: AnalysisResults | null) => void;
  loadFromStorage: () => AnalysisResults | null;
  clearResults: () => void;
}

const AnalysisContext = createContext<AnalysisContextValue | undefined>(
  undefined
);

export function AnalysisProvider({ children }: { children: React.ReactNode }) {
  const [results, setResultsState] = useState<AnalysisResults | null>(null);

  const setResults = useCallback((value: AnalysisResults | null) => {
    setResultsState(value);
    if (value) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const loadFromStorage = useCallback(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    try {
      const parsed = JSON.parse(stored) as AnalysisResults;
      setResultsState(parsed);
      return parsed;
    } catch {
      return null;
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults(null);
  }, [setResults]);

  const value = useMemo(
    () => ({ results, setResults, loadFromStorage, clearResults }),
    [results, setResults, loadFromStorage, clearResults]
  );

  return (
    <AnalysisContext.Provider value={value}>
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysisContext() {
  const ctx = useContext(AnalysisContext);
  if (!ctx) {
    throw new Error("useAnalysisContext deve ser usado com AnalysisProvider");
  }
  return ctx;
}
