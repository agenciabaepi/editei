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
  const rafIdRef = useRef<number | null>(null);
  const pendingSaveRef = useRef(false);
  const modifyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Keep save ref updated
  useEffect(() => {
    saveRef.current = save;
  }, [save]);

  useEffect(() => {
    if (!canvas) return;
    
    // Use requestAnimationFrame for better performance
    const scheduleSave = () => {
      if (pendingSaveRef.current) return;
      pendingSaveRef.current = true;
      
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
      
      rafIdRef.current = requestAnimationFrame(() => {
        // Use requestIdleCallback if available for non-critical saves
        if ('requestIdleCallback' in window) {
          requestIdleCallback(() => {
            saveRef.current();
            pendingSaveRef.current = false;
          }, { timeout: 1000 });
        } else {
          // Fallback: use setTimeout with longer delay
          setTimeout(() => {
            saveRef.current();
            pendingSaveRef.current = false;
          }, 300);
        }
        rafIdRef.current = null;
      });
    };
    
    // Throttled save for modifications (very frequent during dragging/resizing)
    const throttledModifySave = () => {
      if (modifyTimeoutRef.current) return;
      modifyTimeoutRef.current = setTimeout(() => {
        scheduleSave();
        modifyTimeoutRef.current = null;
      }, 500); // Only save every 500ms during modifications
    };
    
    // Immediate save for add/remove (less frequent)
    const immediateSave = () => {
      scheduleSave();
    };
    
    canvas.on("object:added", immediateSave);
    canvas.on("object:removed", immediateSave);
    // Throttled save for modifications (very frequent)
    canvas.on("object:modified", throttledModifySave);
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
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
      if (modifyTimeoutRef.current) {
        clearTimeout(modifyTimeoutRef.current);
      }
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
