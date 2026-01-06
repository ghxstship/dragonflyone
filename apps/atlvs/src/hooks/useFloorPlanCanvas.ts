import { useState, useCallback, useRef, useEffect } from 'react';

export interface CanvasObject {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  label?: string;
  locked: boolean;
  layer: number;
}

export interface CanvasState {
  objects: CanvasObject[];
  selectedIds: string[];
  zoom: number;
  panX: number;
  panY: number;
  gridEnabled: boolean;
  snapToGrid: boolean;
  gridSize: number;
}

export interface CanvasHistory {
  past: CanvasState[];
  present: CanvasState;
  future: CanvasState[];
}

const initialState: CanvasState = {
  objects: [],
  selectedIds: [],
  zoom: 1,
  panX: 0,
  panY: 0,
  gridEnabled: true,
  snapToGrid: true,
  gridSize: 20,
};

export function useFloorPlanCanvas(initialObjects?: CanvasObject[]) {
  const [history, setHistory] = useState<CanvasHistory>({
    past: [],
    present: {
      ...initialState,
      objects: initialObjects || [],
    },
    future: [],
  });

  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const state = history.present;

  // Auto-save functionality - debounced save on state changes
  useEffect(() => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    
    autoSaveTimerRef.current = setTimeout(() => {
      // Save to localStorage as a backup
      try {
        localStorage.setItem('floorplan_autosave', JSON.stringify(state));
        setLastSaved(new Date());
      } catch {
        // Storage quota exceeded or unavailable - silently fail
      }
    }, 2000); // 2 second debounce

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [state]);

  const pushState = useCallback((newState: CanvasState) => {
    setHistory((prev) => ({
      past: [...prev.past.slice(-19), prev.present],
      present: newState,
      future: [],
    }));
  }, []);

  const undo = useCallback(() => {
    setHistory((prev) => {
      if (prev.past.length === 0) return prev;
      const previous = prev.past[prev.past.length - 1];
      return {
        past: prev.past.slice(0, -1),
        present: previous,
        future: [prev.present, ...prev.future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setHistory((prev) => {
      if (prev.future.length === 0) return prev;
      const next = prev.future[0];
      return {
        past: [...prev.past, prev.present],
        present: next,
        future: prev.future.slice(1),
      };
    });
  }, []);

  const addObject = useCallback((object: Omit<CanvasObject, 'id'>) => {
    const newObject: CanvasObject = {
      ...object,
      id: `obj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    pushState({
      ...state,
      objects: [...state.objects, newObject],
      selectedIds: [newObject.id],
    });
    return newObject.id;
  }, [state, pushState]);

  const updateObject = useCallback((id: string, updates: Partial<CanvasObject>) => {
    pushState({
      ...state,
      objects: state.objects.map((obj) =>
        obj.id === id ? { ...obj, ...updates } : obj
      ),
    });
  }, [state, pushState]);

  const deleteObjects = useCallback((ids: string[]) => {
    pushState({
      ...state,
      objects: state.objects.filter((obj) => !ids.includes(obj.id)),
      selectedIds: state.selectedIds.filter((id) => !ids.includes(id)),
    });
  }, [state, pushState]);

  const selectObjects = useCallback((ids: string[], append = false) => {
    setHistory((prev) => ({
      ...prev,
      present: {
        ...prev.present,
        selectedIds: append
          ? [...new Set([...prev.present.selectedIds, ...ids])]
          : ids,
      },
    }));
  }, []);

  const clearSelection = useCallback(() => {
    setHistory((prev) => ({
      ...prev,
      present: { ...prev.present, selectedIds: [] },
    }));
  }, []);

  const moveObjects = useCallback((ids: string[], deltaX: number, deltaY: number) => {
    const snapToGridValue = (value: number) => {
      if (!state.snapToGrid) return value;
      return Math.round(value / state.gridSize) * state.gridSize;
    };

    pushState({
      ...state,
      objects: state.objects.map((obj) =>
        ids.includes(obj.id)
          ? {
              ...obj,
              x: snapToGridValue(obj.x + deltaX),
              y: snapToGridValue(obj.y + deltaY),
            }
          : obj
      ),
    });
  }, [state, pushState]);

  const rotateObjects = useCallback((ids: string[], angle: number) => {
    pushState({
      ...state,
      objects: state.objects.map((obj) =>
        ids.includes(obj.id)
          ? { ...obj, rotation: (obj.rotation + angle) % 360 }
          : obj
      ),
    });
  }, [state, pushState]);

  const setZoom = useCallback((zoom: number) => {
    setHistory((prev) => ({
      ...prev,
      present: { ...prev.present, zoom: Math.max(0.1, Math.min(3, zoom)) },
    }));
  }, []);

  const setPan = useCallback((panX: number, panY: number) => {
    setHistory((prev) => ({
      ...prev,
      present: { ...prev.present, panX, panY },
    }));
  }, []);

  const toggleGrid = useCallback(() => {
    setHistory((prev) => ({
      ...prev,
      present: { ...prev.present, gridEnabled: !prev.present.gridEnabled },
    }));
  }, []);

  const toggleSnapToGrid = useCallback(() => {
    setHistory((prev) => ({
      ...prev,
      present: { ...prev.present, snapToGrid: !prev.present.snapToGrid },
    }));
  }, []);

  const duplicateObjects = useCallback((ids: string[]) => {
    const objectsToDuplicate = state.objects.filter((obj) => ids.includes(obj.id));
    const duplicated = objectsToDuplicate.map((obj) => ({
      ...obj,
      id: `obj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      x: obj.x + state.gridSize,
      y: obj.y + state.gridSize,
    }));
    pushState({
      ...state,
      objects: [...state.objects, ...duplicated],
      selectedIds: duplicated.map((obj) => obj.id),
    });
  }, [state, pushState]);

  const bringToFront = useCallback((ids: string[]) => {
    const maxLayer = Math.max(...state.objects.map((obj) => obj.layer), 0);
    pushState({
      ...state,
      objects: state.objects.map((obj) =>
        ids.includes(obj.id) ? { ...obj, layer: maxLayer + 1 } : obj
      ),
    });
  }, [state, pushState]);

  const sendToBack = useCallback((ids: string[]) => {
    const minLayer = Math.min(...state.objects.map((obj) => obj.layer), 0);
    pushState({
      ...state,
      objects: state.objects.map((obj) =>
        ids.includes(obj.id) ? { ...obj, layer: minLayer - 1 } : obj
      ),
    });
  }, [state, pushState]);

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  return {
    state,
    canUndo,
    canRedo,
    lastSaved,
    undo,
    redo,
    addObject,
    updateObject,
    deleteObjects,
    selectObjects,
    clearSelection,
    moveObjects,
    rotateObjects,
    setZoom,
    setPan,
    toggleGrid,
    toggleSnapToGrid,
    duplicateObjects,
    bringToFront,
    sendToBack,
  };
}
