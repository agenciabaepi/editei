import { fabric } from "fabric";
import { useEffect, useRef } from "react";

interface UseCanvasEventsProps {
  save: () => void;
  canvas: fabric.Canvas | null;
  setSelectedObjects: (objects: fabric.Object[]) => void;
  clearSelectionCallback?: () => void;
};

export const useCanvasEvents = ({
  save,
  canvas,
  setSelectedObjects,
  clearSelectionCallback,
}: UseCanvasEventsProps) => {
  const saveRef = useRef(save);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Keep save ref updated
  useEffect(() => {
    saveRef.current = save;
  }, [save]);

  useEffect(() => {
    if (!canvas) return;
    
    // Throttled save to avoid blocking UI
    const throttledSave = () => {
      if (saveTimeoutRef.current) return;
      saveTimeoutRef.current = setTimeout(() => {
        saveRef.current();
        saveTimeoutRef.current = null;
      }, 50); // Throttle to max 20 calls per second
    };
    
    // Immediate save for add/remove (less frequent)
    canvas.on("object:added", () => saveRef.current());
    canvas.on("object:removed", () => saveRef.current());
    // Throttled save for modifications (very frequent)
    canvas.on("object:modified", throttledSave);
    canvas.on("selection:created", (e) => {
      setSelectedObjects(e.selected || []);
    });
    canvas.on("selection:updated", (e) => {
      setSelectedObjects(e.selected || []);
    });
    canvas.on("selection:cleared", () => {
      setSelectedObjects([]);
      clearSelectionCallback?.();
    });

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (canvas) {
        canvas.off("object:added");
        canvas.off("object:removed");
        canvas.off("object:modified");
        canvas.off("selection:created");
        canvas.off("selection:updated");
        canvas.off("selection:cleared");
      }
    };
  },
  [
    canvas,
    clearSelectionCallback,
    setSelectedObjects,
    // save removed from deps - using ref instead
  ]);
};
