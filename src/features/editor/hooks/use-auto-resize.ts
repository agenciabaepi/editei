import { fabric } from "fabric";
import { useCallback, useEffect } from "react";

interface UseAutoResizeProps {
  canvas: fabric.Canvas | null;
  container: HTMLDivElement | null;
}

export const useAutoResize = ({ canvas, container }: UseAutoResizeProps) => {
  const autoZoom = useCallback(() => {
    if (!canvas || !container) return;

    const width = container.offsetWidth;
    const height = container.offsetHeight;

    // Verificar se canvas está inicializado antes de definir dimensões
    if (canvas && canvas.setWidth && canvas.setHeight) {
      canvas.setWidth(width);
      canvas.setHeight(height);
    } else {
      return; // Canvas não está pronto, sair
    }

    const center = canvas.getCenter();
    const zoomRatio = 0.85;
    
    const localWorkspace = canvas
      .getObjects()
      .find((object) => object.name === "clip");

    if (!localWorkspace) {
      canvas.renderAll();
      return;
    }

    // @ts-ignore
    const scale = fabric.util.findScaleToFit(localWorkspace, {
      width: width,
      height: height,
    });

    const zoom = zoomRatio * scale;

    canvas.setViewportTransform(fabric.iMatrix.concat());
    canvas.zoomToPoint(new fabric.Point(center.left, center.top), zoom);

    const workspaceCenter = localWorkspace.getCenterPoint();
    const viewportTransform = canvas.viewportTransform;

    if (
      canvas.width === undefined ||
      canvas.height === undefined ||
      !viewportTransform
    ) {
      return;
    }

    viewportTransform[4] = canvas.width / 2 - workspaceCenter.x * viewportTransform[0];
    viewportTransform[5] = canvas.height / 2 - workspaceCenter.y * viewportTransform[3];

    canvas.setViewportTransform(viewportTransform);

    localWorkspace.clone((cloned: fabric.Rect) => {
      canvas.clipPath = cloned;
      // Garantir que o workspace seja renderizado corretamente
      localWorkspace.setCoords();
      canvas.requestRenderAll();
    });
  }, [canvas, container]);

  useEffect(() => {
    let resizeObserver: ResizeObserver | null = null;
    let resizeTimeout: NodeJS.Timeout | null = null;
    let isInitialized = false;

    if (canvas && container) {
      // Only auto-zoom on initial mount, not on every resize
      const handleResize = () => {
        // Clear any pending resize
        if (resizeTimeout) {
          clearTimeout(resizeTimeout);
        }
        
        // Only auto-zoom on initial load, not on every resize
        if (!isInitialized) {
          resizeTimeout = setTimeout(() => {
            autoZoom();
            isInitialized = true;
          }, 100);
        }
      };

      resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(container);
      
      // Initial zoom after a short delay
      setTimeout(() => {
        if (!isInitialized) {
          autoZoom();
          isInitialized = true;
        }
      }, 200);
    }

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
    };
  }, [canvas, container, autoZoom]);

  return { autoZoom };
};
