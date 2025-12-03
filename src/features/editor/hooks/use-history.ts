import { fabric } from "fabric";
import { useCallback, useRef, useState } from "react";

import { JSON_KEYS } from "@/features/editor/types";

interface UseHistoryProps {
  canvas: fabric.Canvas | null;
  saveCallback?: (values: {
    json: string;
    height: number;
    width: number;
    thumbnail?: string;
  }) => void;
};

export const useHistory = ({ canvas, saveCallback }: UseHistoryProps) => {
  const [historyIndex, setHistoryIndex] = useState(0);
  const canvasHistory = useRef<string[]>([]);
  const skipSave = useRef(false);
  const lastThumbnailTime = useRef(0);
  const THUMBNAIL_INTERVAL = 3000; // 3 seconds (reduced for faster updates)

  const canUndo = useCallback(() => {
    return historyIndex > 0;
  }, [historyIndex]);

  const canRedo = useCallback(() => {
    return historyIndex < canvasHistory.current.length - 1;
  }, [historyIndex]);

  const save = useCallback((skip = false) => {
    if (!canvas) return;

    const currentState = canvas.toJSON(JSON_KEYS);
    const json = JSON.stringify(currentState);

    if (!skip && !skipSave.current) {
      canvasHistory.current.push(json);
      setHistoryIndex(canvasHistory.current.length - 1);
    }

    const workspace = canvas
      .getObjects()
      .find((object) => object.name === "clip");
    const height = workspace?.height || 0;
    const width = workspace?.width || 0;

    // Generate thumbnail only if enough time has passed (to avoid blocking)
    // Only generate thumbnail every 3 seconds to reduce load
    let thumbnail: string | undefined;
    const now = Date.now();
    
    // Only generate thumbnail if enough time has passed
    if (now - lastThumbnailTime.current > THUMBNAIL_INTERVAL) {
      try {
        const workspaceRect = workspace as fabric.Rect;
        if (workspaceRect && width > 0 && height > 0) {
          // Save current viewport transform
          const vpt = canvas.viewportTransform;
          // Reset viewport for thumbnail generation
          canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
          
          // Generate thumbnail at 40% scale for better quality
          const scale = 0.4;
          const thumbnailOptions = {
            format: 'png',
            quality: 1.0, // Maximum quality
            multiplier: scale,
            left: workspaceRect.left || 0,
            top: workspaceRect.top || 0,
            width: width,
            height: height,
          };
          
          thumbnail = canvas.toDataURL(thumbnailOptions);
          lastThumbnailTime.current = now;
          
          // Restore viewport transform
          if (vpt) {
            canvas.setViewportTransform(vpt);
          }
        }
      } catch (error) {
        console.error('Error generating thumbnail:', error);
        // Continue without thumbnail if generation fails
      }
    }

    // Save immediately (with or without thumbnail)
    saveCallback?.({ json, height, width, thumbnail });
  }, 
  [
    canvas,
    saveCallback,
  ]);

  const undo = useCallback(() => {
    if (canUndo()) {
      skipSave.current = true;
      canvas?.clear().renderAll();

      const previousIndex = historyIndex - 1;
      const previousState = JSON.parse(
        canvasHistory.current[previousIndex]
      );

      canvas?.loadFromJSON(previousState, () => {
        canvas.renderAll();
        setHistoryIndex(previousIndex);
        skipSave.current = false;
      });
    }
  }, [canUndo, canvas, historyIndex]);

  const redo = useCallback(() => {
    if (canRedo()) {
      skipSave.current = true;
      canvas?.clear().renderAll();

      const nextIndex = historyIndex + 1;
      const nextState = JSON.parse(
        canvasHistory.current[nextIndex]
      );

      canvas?.loadFromJSON(nextState, () => {
        canvas.renderAll();
        setHistoryIndex(nextIndex);
        skipSave.current = false;
      });
    }
  }, [canvas, historyIndex, canRedo]);

  return { 
    save,
    canUndo,
    canRedo,
    undo,
    redo,
    setHistoryIndex,
    canvasHistory,
  };
};
