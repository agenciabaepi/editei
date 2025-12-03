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
    if (!canvas) {
      console.warn('[History] Save called but canvas is null');
      return;
    }

    console.log('[History] Save called, skip:', skip);
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

    console.log('[History] Calling saveCallback with:', { 
      hasJson: !!json, 
      jsonLength: json.length,
      width, 
      height 
    });

    // Save immediately without thumbnail (non-blocking)
    if (saveCallback) {
      saveCallback({ json, height, width });
    } else {
      console.warn('[History] saveCallback is not defined!');
    }

    // Generate thumbnail asynchronously to avoid blocking UI
    // Only generate thumbnail every 3 seconds to reduce load
    const now = Date.now();
    if (now - lastThumbnailTime.current > THUMBNAIL_INTERVAL) {
      // Use setTimeout with low priority to avoid blocking
      setTimeout(() => {
        try {
          const workspaceRect = workspace as fabric.Rect;
          if (workspaceRect && width > 0 && height > 0 && canvas) {
            // Save current viewport transform
            const vpt = canvas.viewportTransform ? [...canvas.viewportTransform] : [1, 0, 0, 1, 0, 0];
            
            // Generate thumbnail without resetting viewport (to avoid zoom issues)
            // Use current viewport and just scale down
            const scale = 0.4;
            const thumbnailOptions = {
              format: 'png',
              quality: 1.0, // Maximum quality
              multiplier: scale,
            };
            
            let thumbnail: string;
            try {
              thumbnail = canvas.toDataURL(thumbnailOptions);
              lastThumbnailTime.current = Date.now();
              
              // Update with thumbnail asynchronously
              saveCallback?.({ json, height, width, thumbnail });
            } catch (thumbnailError: any) {
              // Handle "Tainted canvas" error
              if (thumbnailError.name === 'SecurityError' || thumbnailError.message?.includes('Tainted canvases')) {
                console.warn('Cannot generate thumbnail due to CORS restrictions.');
                // Continue without thumbnail
              } else {
                console.error('Error generating thumbnail:', thumbnailError);
              }
            }
          }
        } catch (error) {
          console.error('Error in thumbnail generation process:', error);
          // Continue without thumbnail if generation fails
        }
      }, 100); // Small delay to avoid blocking
    }
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
