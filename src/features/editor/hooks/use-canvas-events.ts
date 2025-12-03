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
    
    // Garantir que o workspace seja renderizado quando o viewport mudar
    const handleViewportChange = () => {
      const workspace = canvas.getObjects().find((obj: any) => obj.name === "clip");
      if (workspace) {
        workspace.setCoords();
        // Usar requestRenderAll para melhor performance
        canvas.requestRenderAll();
      }
    };
    
    // Listener para mudanças no viewport (zoom, pan, etc.)
    canvas.on('mouse:wheel', handleViewportChange);
    
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
      // Filtrar workspace (background fixo) da seleção
      const filtered = (e.selected || []).filter((obj: any) => obj.name !== "clip");
      setSelectedObjects(filtered);
      // Se apenas o workspace foi selecionado, limpar seleção
      if (filtered.length === 0 && (e.selected || []).length > 0) {
        canvas.discardActiveObject();
      }
    });
    canvas.on("selection:updated", (e) => {
      // Filtrar workspace (background fixo) da seleção
      const filtered = (e.selected || []).filter((obj: any) => obj.name !== "clip");
      setSelectedObjects(filtered);
      // Se apenas o workspace foi selecionado, limpar seleção
      if (filtered.length === 0 && (e.selected || []).length > 0) {
        canvas.discardActiveObject();
      }
    });
    canvas.on("selection:cleared", () => {
      setSelectedObjects([]);
      clearSelectionCallback?.();
    });
    
    // Prevenir seleção do workspace
    canvas.on("mouse:down", (e) => {
      if (e.target && (e.target as any).name === "clip") {
        canvas.discardActiveObject();
        e.e.preventDefault();
        e.e.stopPropagation();
      }
    });

    return () => {
      if (canvas) {
        canvas.off('mouse:wheel', handleViewportChange);
        canvas.off("object:added");
        canvas.off("object:removed");
        canvas.off("object:modified");
        canvas.off("selection:created");
        canvas.off("selection:updated");
        canvas.off("selection:cleared");
      }
      const rafId = rafIdRef.current;
      const modifyTimeout = modifyTimeoutRef.current;
      const saveTimeout = saveTimeoutRef.current;
      
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      if (modifyTimeout) {
        clearTimeout(modifyTimeout);
      }
      if (saveTimeout) {
        clearTimeout(saveTimeout);
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
