"use client";

import { useCallback, useRef, useState } from "react";

export interface UndoRedoOptions<T> {
  /** Maximum number of history states to retain (default 100) */
  limit?: number;
  /** Throttle snapshots in milliseconds to avoid excessive history writes (default 150ms) */
  throttleMs?: number;
  /** Equality check to skip redundant snapshots */
  isEqual?: (a: T, b: T) => boolean;
}

export interface UndoRedoApi<T> {
  value: T;
  setValue: (next: T, options?: { skipHistory?: boolean; forceSnapshot?: boolean }) => void;
  undo: () => void;
  redo: () => void;
  reset: (next?: T) => void;
  clearHistory: () => void;
  canUndo: boolean;
  canRedo: boolean;
  historyLength: number;
  futureLength: number;
}

export function useUndoRedo<T>(initialValue: T, options: UndoRedoOptions<T> = {}): UndoRedoApi<T> {
  const { limit = 100, throttleMs = 150, isEqual } = options;

  const [present, setPresent] = useState<T>(initialValue);
  const pastRef = useRef<T[]>([]);
  const futureRef = useRef<T[]>([]);
  const lastSnapshotRef = useRef<number>(Date.now());

  const snapshot = useCallback(
    (next: T, force = false) => {
      const now = Date.now();
      const shouldThrottle = !force && throttleMs > 0 && now - lastSnapshotRef.current < throttleMs;
      if (shouldThrottle) {
        setPresent(next);
        return;
      }

      const current = present;
      if (isEqual ? isEqual(current, next) : current === next) {
        return;
      }

      const newPast = [...pastRef.current, current];
      if (newPast.length > limit) {
        newPast.shift();
      }
      pastRef.current = newPast;
      futureRef.current = [];
      setPresent(next);
      lastSnapshotRef.current = now;
    },
    [present, throttleMs, limit, isEqual]
  );

  const setValue = useCallback(
    (next: T, opts?: { skipHistory?: boolean; forceSnapshot?: boolean }) => {
      if (opts?.skipHistory) {
        setPresent(next);
        return;
      }
      snapshot(next, Boolean(opts?.forceSnapshot));
    },
    [snapshot]
  );

  const undo = useCallback(() => {
    if (pastRef.current.length === 0) return;
    const previous = pastRef.current[pastRef.current.length - 1];
    pastRef.current = pastRef.current.slice(0, -1);
    futureRef.current = [present, ...futureRef.current];
    setPresent(previous);
  }, [present]);

  const redo = useCallback(() => {
    if (futureRef.current.length === 0) return;
    const next = futureRef.current[0];
    futureRef.current = futureRef.current.slice(1);
    pastRef.current = [...pastRef.current, present];
    setPresent(next);
  }, [present]);

  const reset = useCallback((next?: T) => {
    pastRef.current = [];
    futureRef.current = [];
    setPresent(next ?? initialValue);
    lastSnapshotRef.current = Date.now();
  }, [initialValue]);

  const clearHistory = useCallback(() => {
    pastRef.current = [];
    futureRef.current = [];
    lastSnapshotRef.current = Date.now();
  }, []);

  const canUndo = pastRef.current.length > 0;
  const canRedo = futureRef.current.length > 0;

  const historyLength = pastRef.current.length;
  const futureLength = futureRef.current.length;

  return {
    value: present,
    setValue,
    undo,
    redo,
    reset,
    clearHistory,
    canUndo,
    canRedo,
    historyLength,
    futureLength,
  };
}
