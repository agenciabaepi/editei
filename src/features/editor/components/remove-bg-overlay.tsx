"use client";

import { useEffect, useState, useRef } from "react";
import { Loader } from "lucide-react";
import { fabric } from "fabric";

import { Editor } from "@/features/editor/types";

import { cn } from "@/lib/utils";

interface RemoveBgOverlayProps {
  editor: Editor | undefined;
  activeTool: string;
  isProcessing?: boolean;
};

// Global state to share processing status between sidebar and overlay
let globalProcessingState = false;
const processingListeners = new Set<(isProcessing: boolean) => void>();

export const setRemoveBgProcessing = (isProcessing: boolean) => {
  globalProcessingState = isProcessing;
  processingListeners.forEach(listener => listener(isProcessing));
};

export const RemoveBgOverlay = ({
  editor,
  activeTool,
  isProcessing: externalIsProcessing,
}: RemoveBgOverlayProps) => {
  const [isProcessing, setIsProcessing] = useState(globalProcessingState);
  
  useEffect(() => {
    const listener = (processing: boolean) => {
      setIsProcessing(processing);
    };
    processingListeners.add(listener);
    setIsProcessing(globalProcessingState);
    
    return () => {
      processingListeners.delete(listener);
    };
  }, []);
  
  // Use external prop if provided, otherwise use global state
  const processing = externalIsProcessing !== undefined ? externalIsProcessing : isProcessing;
  const [overlayPosition, setOverlayPosition] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
  } | null>(null);

  // Only show overlay when remove-bg tool is active and processing
  const shouldShow = activeTool === "remove-bg" && processing;

  useEffect(() => {
    if (!shouldShow || !editor?.canvas) {
      setOverlayPosition(null);
      return;
    }

    let rafId: number | null = null;
    let needsUpdate = false;

    const updateOverlayPosition = () => {
      const selectedObject = editor.selectedObjects[0];
      
      if (!selectedObject || selectedObject.type !== "image") {
        setOverlayPosition(null);
        return;
      }

      const canvas = editor.canvas;
      if (!canvas) return;

      const canvasEl = canvas.getElement();
      if (!canvasEl) return;

      const containerEl = canvasEl.parentElement;
      if (!containerEl) return;

      // Get object bounding box in canvas coordinates
      const boundingRect = selectedObject.getBoundingRect();
      const vpt = canvas.viewportTransform;
      
      if (!vpt) return;

      // Get canvas and container positions
      const canvasRect = canvasEl.getBoundingClientRect();
      const containerRect = containerEl.getBoundingClientRect();

      // Transform object coordinates to viewport coordinates
      const topLeft = fabric.util.transformPoint(
        new fabric.Point(boundingRect.left, boundingRect.top),
        vpt
      );
      
      const bottomRight = fabric.util.transformPoint(
        new fabric.Point(boundingRect.left + boundingRect.width, boundingRect.top + boundingRect.height),
        vpt
      );

      // Calculate position relative to container
      const offsetX = canvasRect.left - containerRect.left;
      const offsetY = canvasRect.top - containerRect.top;

      setOverlayPosition({
        left: offsetX + topLeft.x,
        top: offsetY + topLeft.y,
        width: Math.abs(bottomRight.x - topLeft.x),
        height: Math.abs(bottomRight.y - topLeft.y),
      });
    };

    // Throttled update using requestAnimationFrame
    const scheduleUpdate = () => {
      if (!needsUpdate) {
        needsUpdate = true;
        rafId = requestAnimationFrame(() => {
          needsUpdate = false;
          updateOverlayPosition();
        });
      }
    };

    // Update position initially
    updateOverlayPosition();

    // Update position on canvas events (throttled)
    const handleUpdate = () => {
      scheduleUpdate();
    };

    const canvas = editor.canvas;
    // Only listen to essential events, not every mouse move
    canvas.on("object:modified", handleUpdate);
    canvas.on("object:moving", handleUpdate);
    canvas.on("object:scaling", handleUpdate);
    canvas.on("object:rotating", handleUpdate);
    
    // Use after:render but throttle it
    let renderTimeout: NodeJS.Timeout | null = null;
    canvas.on("after:render", () => {
      if (renderTimeout) return;
      renderTimeout = setTimeout(() => {
        scheduleUpdate();
        renderTimeout = null;
      }, 16); // ~60fps max
    });

    // Update on viewport changes (throttled)
    let wheelTimeout: NodeJS.Timeout | null = null;
    const handleWheel = () => {
      if (wheelTimeout) return;
      wheelTimeout = setTimeout(() => {
        scheduleUpdate();
        wheelTimeout = null;
      }, 50); // Throttle wheel events
    };
    canvas.on("mouse:wheel", handleWheel);

    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      if (renderTimeout) {
        clearTimeout(renderTimeout);
      }
      if (wheelTimeout) {
        clearTimeout(wheelTimeout);
      }
      canvas.off("object:modified", handleUpdate);
      canvas.off("object:moving", handleUpdate);
      canvas.off("object:scaling", handleUpdate);
      canvas.off("object:rotating", handleUpdate);
      canvas.off("after:render");
      canvas.off("mouse:wheel", handleWheel);
    };
  }, [shouldShow, editor, processing]);

  if (!shouldShow || !overlayPosition) {
    return null;
  }

  return (
    <div
      className="absolute pointer-events-none z-50"
      style={{
        left: `${overlayPosition.left}px`,
        top: `${overlayPosition.top}px`,
        width: `${overlayPosition.width}px`,
        height: `${overlayPosition.height}px`,
      }}
    >
      {/* Simple overlay with subtle animation */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
        <div className="flex flex-col items-center gap-2">
          <Loader className="size-8 text-white animate-spin" />
          <div className="text-white text-xs font-medium">
            Processando...
          </div>
        </div>
      </div>
    </div>
  );
};

