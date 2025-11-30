import { fabric } from "fabric";
import { useCallback, useState, useMemo, useRef } from "react";

import { 
  Editor, 
  FILL_COLOR,
  STROKE_WIDTH,
  STROKE_COLOR,
  CIRCLE_OPTIONS,
  DIAMOND_OPTIONS,
  TRIANGLE_OPTIONS,
  BuildEditorProps, 
  RECTANGLE_OPTIONS,
  EditorHookProps,
  STROKE_DASH_ARRAY,
  TEXT_OPTIONS,
  FONT_FAMILY,
  FONT_WEIGHT,
  FONT_SIZE,
  JSON_KEYS,
} from "@/features/editor/types";
import { useHistory } from "@/features/editor/hooks/use-history";
import { 
  createFilter, 
  downloadFile, 
  isTextType,
  transformText
} from "@/features/editor/utils";
import { useHotkeys } from "@/features/editor/hooks/use-hotkeys";
import { useClipboard } from "@/features/editor/hooks//use-clipboard";
import { useAutoResize } from "@/features/editor/hooks/use-auto-resize";
import { useCanvasEvents } from "@/features/editor/hooks/use-canvas-events";
import { useWindowEvents } from "@/features/editor/hooks/use-window-events";
import { useLoadState } from "@/features/editor/hooks/use-load-state";
import { fontLoader, getFontStack } from "@/features/editor/utils/font-loader";

const buildEditor = ({
  save,
  undo,
  redo,
  canRedo,
  canUndo,
  autoZoom,
  copy,
  paste,
  canvas,
  fillColor,
  fontFamily,
  setFontFamily,
  setFillColor,
  strokeColor,
  setStrokeColor,
  strokeWidth,
  setStrokeWidth,
  selectedObjects,
  strokeDashArray,
  setStrokeDashArray,
}: BuildEditorProps): Editor => {
  const generateSaveOptions = () => {
    const { width, height, left, top } = getWorkspace() as fabric.Rect;

    return {
      name: "Image",
      format: "png",
      quality: 1,
      width,
      height,
      left,
      top,
    };
  };

  const savePng = () => {
    const options = generateSaveOptions();

    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    const dataUrl = canvas.toDataURL(options);

    downloadFile(dataUrl, "png");
    autoZoom();
  };

  const saveSvg = () => {
    const options = generateSaveOptions();

    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    const dataUrl = canvas.toDataURL(options);

    downloadFile(dataUrl, "svg");
    autoZoom();
  };

  const saveJpg = () => {
    const options = generateSaveOptions();

    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    const dataUrl = canvas.toDataURL(options);

    downloadFile(dataUrl, "jpg");
    autoZoom();
  };

  const saveJson = async () => {
    const dataUrl = canvas.toJSON(JSON_KEYS);

    await transformText(dataUrl.objects);
    const fileString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(dataUrl, null, "\t"),
    )}`;
    downloadFile(fileString, "json");
  };

  const loadJson = (json: string) => {
    const data = JSON.parse(json);

    canvas.loadFromJSON(data, () => {
      autoZoom();
    });
  };

  const getWorkspace = () => {
    return canvas
    .getObjects()
    .find((object) => object.name === "clip");
  };

  const ensureWorkspaceExists = () => {
    // Check if canvas is valid before proceeding
    if (!canvas || !canvas.getContext) {
      console.warn("Canvas is not properly initialized");
      return null;
    }

    let workspace = getWorkspace();
    if (!workspace) {
      // Recreate workspace if it's missing
      workspace = new fabric.Rect({
        width: 900,
        height: 1200,
        name: "clip",
        fill: "white",
        selectable: false,
        hasControls: false,
        evented: false,
        hoverCursor: "default",
        moveCursor: "default",
        visible: true,
        opacity: 1,
        stroke: "#e5e7eb",
        strokeWidth: 1,
        shadow: new fabric.Shadow({
          color: "rgba(0,0,0,0.8)",
          blur: 5,
        }),
      });
      canvas.add(workspace);
      canvas.centerObject(workspace);
      canvas.sendToBack(workspace);
      // Safe render with canvas validation
      if (canvas.getContext && canvas.getContext()) {
        try {
          canvas.renderAll();
        } catch (error) {
          console.warn("Canvas render error during workspace creation:", error);
        }
      }
      console.log("Workspace recreated as background", workspace);
    } else {
      // Ensure existing workspace is visible
      workspace.set({ visible: true, opacity: 1 });
      canvas.sendToBack(workspace);
      // Safe render with canvas validation
      if (canvas.getContext && canvas.getContext()) {
        try {
          canvas.renderAll();
        } catch (error) {
          console.warn("Canvas render error during workspace update:", error);
        }
      }
    }
    return workspace;
  };

  const center = (object: fabric.Object) => {
    const workspace = ensureWorkspaceExists();
    if (!workspace) return;
    
    const center = workspace.getCenterPoint();

    // @ts-ignore
    canvas._centerObject(object, center);
  };

  const addToCanvas = (object: fabric.Object) => {
    center(object);
    canvas.add(object);
    canvas.setActiveObject(object);
  };

  return {
    savePng,
    saveJpg,
    saveSvg,
    saveJson,
    loadJson,
    canUndo,
    canRedo,
    autoZoom,
    getWorkspace: () => {
      return getWorkspace();
    },
    ensureWorkspaceVisible: (): fabric.Object | undefined => {
      const workspace = ensureWorkspaceExists();
      if (!workspace) return;
      
      workspace.set({ 
        visible: true, 
        opacity: 1,
        selectable: false,
        evented: false,
      });
      canvas.sendToBack(workspace);
      if (canvas.getContext && canvas.getContext()) {
        try {
          canvas.renderAll();
        } catch (error) {
          console.warn("Canvas render error in ensureWorkspaceVisible:", error);
        }
      }
      console.log("Workspace visibility forced", workspace);
      return workspace;
    },
    zoomIn: () => {
      let zoomRatio = canvas.getZoom();
      zoomRatio += 0.1;
      const center = canvas.getCenter();
      canvas.zoomToPoint(
        new fabric.Point(center.left, center.top),
        Math.min(zoomRatio, 3) // Max zoom 300%
      );
    },
    zoomOut: () => {
      let zoomRatio = canvas.getZoom();
      zoomRatio -= 0.1;
      const center = canvas.getCenter();
      canvas.zoomToPoint(
        new fabric.Point(center.left, center.top),
        Math.max(zoomRatio, 0.1) // Min zoom 10%
      );
    },
    changeSize: (value: { width: number; height: number }) => {
      const workspace = ensureWorkspaceExists();
      if (!workspace) return;

      workspace.set(value);
      canvas.sendToBack(workspace);
      if (canvas.getContext && canvas.getContext()) {
        try {
          canvas.renderAll();
        } catch (error) {
          console.warn("Canvas render error in changeSize:", error);
        }
      }
      
    },
    enableDrawingMode: () => {
      canvas.discardActiveObject();
      canvas.renderAll();
      
      canvas.isDrawingMode = true;
      canvas.freeDrawingBrush.width = strokeWidth;
      canvas.freeDrawingBrush.color = strokeColor;
      
      console.log("Drawing mode enabled", {
        isDrawingMode: canvas.isDrawingMode,
        brushWidth: canvas.freeDrawingBrush.width,
        brushColor: canvas.freeDrawingBrush.color
      });
    },
    disableDrawingMode: () => {
      canvas.isDrawingMode = false;
      console.log("Drawing mode disabled");
    },
    onUndo: () => undo(),
    onRedo: () => redo(),
    onCopy: () => copy(),
    onPaste: () => paste(),
    changeImageFilter: (value: string) => {
      const objects = canvas.getActiveObjects();
      objects.forEach((object) => {
        if (object.type === "image") {
          const imageObject = object as fabric.Image;

          const effect = createFilter(value);

          imageObject.filters = effect ? [effect] : [];
          imageObject.applyFilters();
          canvas.renderAll();
        }
      });
    },
    addImage: (value: string) => {
      fabric.Image.fromURL(
        value,
        (image) => {
          const workspace = getWorkspace();

          image.scaleToWidth(workspace?.width || 0);
          image.scaleToHeight(workspace?.height || 0);

          addToCanvas(image);
        },
        {
          crossOrigin: "anonymous",
        },
      );
    },
    delete: () => {
      canvas.getActiveObjects().forEach((object) => canvas.remove(object));
      canvas.discardActiveObject();
      canvas.renderAll();
    },
    addText: (value, options) => {
      const fontStack = getFontStack(fontFamily);
      
      const object = new fabric.Textbox(value, {
        ...TEXT_OPTIONS,
        fill: fillColor,
        fontFamily: fontStack,
        ...options,
      });
      
      // Store original font name as custom property
      (object as any).originalFontFamily = fontFamily;

      addToCanvas(object);
    },
    getActiveOpacity: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return 1;
      }

      const value = selectedObject.get("opacity") || 1;

      return value;
    },
    changeFontSize: (value: number) => {
      canvas.getActiveObjects().forEach((object) => {
        if (isTextType(object.type)) {
          // @ts-ignore
          // Faulty TS library, fontSize exists.
          object.set({ fontSize: value });
        }
      });
      canvas.renderAll();
    },
    getActiveFontSize: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return FONT_SIZE;
      }

      // @ts-ignore
      // Faulty TS library, fontSize exists.
      const value = selectedObject.get("fontSize") || FONT_SIZE;

      return value;
    },
    changeTextAlign: (value: string) => {
      canvas.getActiveObjects().forEach((object) => {
        if (isTextType(object.type)) {
          // @ts-ignore
          // Faulty TS library, textAlign exists.
          object.set({ textAlign: value });
        }
      });
      canvas.renderAll();
    },
    getActiveTextAlign: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return "left";
      }

      // @ts-ignore
      // Faulty TS library, textAlign exists.
      const value = selectedObject.get("textAlign") || "left";

      return value;
    },
    changeFontUnderline: (value: boolean) => {
      canvas.getActiveObjects().forEach((object) => {
        if (isTextType(object.type)) {
          // @ts-ignore
          // Faulty TS library, underline exists.
          object.set({ underline: value });
        }
      });
      canvas.renderAll();
    },
    getActiveFontUnderline: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return false;
      }

      // @ts-ignore
      // Faulty TS library, underline exists.
      const value = selectedObject.get("underline") || false;

      return value;
    },
    changeFontLinethrough: (value: boolean) => {
      canvas.getActiveObjects().forEach((object) => {
        if (isTextType(object.type)) {
          // @ts-ignore
          // Faulty TS library, linethrough exists.
          object.set({ linethrough: value });
        }
      });
      canvas.renderAll();
    },
    getActiveFontLinethrough: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return false;
      }

      // @ts-ignore
      // Faulty TS library, linethrough exists.
      const value = selectedObject.get("linethrough") || false;

      return value;
    },
    changeFontStyle: (value: string) => {
      canvas.getActiveObjects().forEach((object) => {
        if (isTextType(object.type)) {
          // @ts-ignore
          // Faulty TS library, fontStyle exists.
          object.set({ fontStyle: value });
        }
      });
      canvas.renderAll();
    },
    getActiveFontStyle: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return "normal";
      }

      // @ts-ignore
      // Faulty TS library, fontStyle exists.
      const value = selectedObject.get("fontStyle") || "normal";

      return value;
    },
    changeFontWeight: (value: number) => {
      canvas.getActiveObjects().forEach((object) => {
        if (isTextType(object.type)) {
          // @ts-ignore
          // Faulty TS library, fontWeight exists.
          object.set({ fontWeight: value });
        }
      });
      canvas.renderAll();
    },
    changeOpacity: (value: number) => {
      canvas.getActiveObjects().forEach((object) => {
        object.set({ opacity: value });
      });
      canvas.renderAll();
    },
    bringForward: () => {
      canvas.getActiveObjects().forEach((object) => {
        canvas.bringForward(object);
      });

      canvas.renderAll();
      
      const workspace = getWorkspace();
      workspace?.sendToBack();
    },
    sendBackwards: () => {
      canvas.getActiveObjects().forEach((object) => {
        canvas.sendBackwards(object);
      });

      canvas.renderAll();
      const workspace = getWorkspace();
      workspace?.sendToBack();
    },
    changeFontFamily: (value: string) => {
      setFontFamily(value);
      
      // Get the proper font stack with fallbacks
      const fontStack = getFontStack(value);
      
      canvas.getActiveObjects().forEach((object) => {
        if (isTextType(object.type)) {
          // @ts-ignore
          // Faulty TS library, fontFamily exists.
          object.set({ fontFamily: fontStack });
          // Store original font name as custom property
          (object as any).originalFontFamily = value;
        }
      });
      
      // Force canvas re-render to apply font changes
      canvas.renderAll();
      
      // Trigger a second render after a short delay to ensure font loading
      setTimeout(() => {
        canvas.renderAll();
      }, 100);
    },
    changeFillColor: (value: string) => {
      setFillColor(value);
      canvas.getActiveObjects().forEach((object) => {
        object.set({ fill: value });
      });
      canvas.renderAll();
    },
    changeStrokeColor: (value: string) => {
      setStrokeColor(value);
      canvas.getActiveObjects().forEach((object) => {
        // Text types don't have stroke
        if (isTextType(object.type)) {
          object.set({ fill: value });
          return;
        }

        object.set({ stroke: value });
      });
      canvas.freeDrawingBrush.color = value;
      canvas.renderAll();
    },
    changeStrokeWidth: (value: number) => {
      setStrokeWidth(value);
      canvas.getActiveObjects().forEach((object) => {
        object.set({ strokeWidth: value });
      });
      canvas.freeDrawingBrush.width = value;
      canvas.renderAll();
    },
    changeStrokeDashArray: (value: number[]) => {
      setStrokeDashArray(value);
      canvas.getActiveObjects().forEach((object) => {
        object.set({ strokeDashArray: value });
      });
      canvas.renderAll();
    },
    addCircle: () => {
      const object = new fabric.Circle({
        ...CIRCLE_OPTIONS,
        fill: fillColor,
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        strokeDashArray: strokeDashArray,
      });

      addToCanvas(object);
    },
    addSoftRectangle: () => {
      const object = new fabric.Rect({
        ...RECTANGLE_OPTIONS,
        rx: 50,
        ry: 50,
        fill: fillColor,
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        strokeDashArray: strokeDashArray,
      });

      addToCanvas(object);
    },
    addRectangle: () => {
      const object = new fabric.Rect({
        ...RECTANGLE_OPTIONS,
        fill: fillColor,
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        strokeDashArray: strokeDashArray,
      });

      addToCanvas(object);
    },
    addTriangle: () => {
      const object = new fabric.Triangle({
        ...TRIANGLE_OPTIONS,
        fill: fillColor,
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        strokeDashArray: strokeDashArray,
      });

      addToCanvas(object);
    },
    addInverseTriangle: () => {
      const HEIGHT = TRIANGLE_OPTIONS.height;
      const WIDTH = TRIANGLE_OPTIONS.width;

      const object = new fabric.Polygon(
        [
          { x: 0, y: 0 },
          { x: WIDTH, y: 0 },
          { x: WIDTH / 2, y: HEIGHT },
        ],
        {
          ...TRIANGLE_OPTIONS,
          fill: fillColor,
          stroke: strokeColor,
          strokeWidth: strokeWidth,
          strokeDashArray: strokeDashArray,
        }
      );

      addToCanvas(object);
    },
    addDiamond: () => {
      const HEIGHT = DIAMOND_OPTIONS.height;
      const WIDTH = DIAMOND_OPTIONS.width;

      const object = new fabric.Polygon([
        { x: WIDTH / 2, y: 0 },
        { x: WIDTH, y: HEIGHT / 2 },
        { x: WIDTH / 2, y: HEIGHT },
        { x: 0, y: HEIGHT / 2 },
      ], {
        ...DIAMOND_OPTIONS,
        fill: fillColor,
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        strokeDashArray: strokeDashArray,
      });

      addToCanvas(object);
    },
    addHexagon: () => {
      const size = 100;
      const points = [];
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        points.push({
          x: size * Math.cos(angle) + size,
          y: size * Math.sin(angle) + size
        });
      }

      const object = new fabric.Polygon(points, {
        left: 100,
        top: 100,
        fill: fillColor,
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        strokeDashArray: strokeDashArray,
      });

      addToCanvas(object);
    },
    addPentagon: () => {
      const size = 100;
      const points = [];
      for (let i = 0; i < 5; i++) {
        const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
        points.push({
          x: size * Math.cos(angle) + size,
          y: size * Math.sin(angle) + size
        });
      }

      const object = new fabric.Polygon(points, {
        left: 100,
        top: 100,
        fill: fillColor,
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        strokeDashArray: strokeDashArray,
      });

      addToCanvas(object);
    },
    addOctagon: () => {
      const size = 100;
      const points = [];
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI) / 4;
        points.push({
          x: size * Math.cos(angle) + size,
          y: size * Math.sin(angle) + size
        });
      }

      const object = new fabric.Polygon(points, {
        left: 100,
        top: 100,
        fill: fillColor,
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        strokeDashArray: strokeDashArray,
      });

      addToCanvas(object);
    },
    addHeart: () => {
      const heartPath = "M12,21.35l-1.45-1.32C5.4,15.36,2,12.28,2,8.5 C2,5.42,4.42,3,7.5,3c1.74,0,3.41,0.81,4.5,2.09C13.09,3.81,14.76,3,16.5,3 C19.58,3,22,5.42,22,8.5c0,3.78-3.4,6.86-8.55,11.54L12,21.35z";
      
      const object = new fabric.Path(heartPath, {
        left: 100,
        top: 100,
        scaleX: 5,
        scaleY: 5,
        fill: fillColor,
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        strokeDashArray: strokeDashArray,
      });

      addToCanvas(object);
    },
    addStar: () => {
      const outerRadius = 80;
      const innerRadius = 40;
      const points = [];
      
      for (let i = 0; i < 10; i++) {
        const angle = (i * Math.PI) / 5;
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        points.push({
          x: radius * Math.cos(angle - Math.PI / 2) + outerRadius,
          y: radius * Math.sin(angle - Math.PI / 2) + outerRadius
        });
      }

      const object = new fabric.Polygon(points, {
        left: 100,
        top: 100,
        fill: fillColor,
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        strokeDashArray: strokeDashArray,
      });

      addToCanvas(object);
    },
    addShield: () => {
      const shieldPath = "M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V11.5C15.4,12.1 16,12.8 16,14V20C16,21.1 15.1,22 14,22H10C8.9,22 8,21.1 8,20V14C8,12.8 8.6,12.1 9.2,11.5V10C9.2,8.6 10.6,7 12,7Z";
      
      const object = new fabric.Path(shieldPath, {
        left: 100,
        top: 100,
        scaleX: 4,
        scaleY: 4,
        fill: fillColor,
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        strokeDashArray: strokeDashArray,
      });

      addToCanvas(object);
    },
    addSpeechBubble: () => {
      const bubblePath = "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.54 0 3-.35 4.31-.99L22 23l-1.99-5.69C20.65 15 21 13.54 21 12c0-5.52-4.48-10-10-10z";
      
      const object = new fabric.Path(bubblePath, {
        left: 100,
        top: 100,
        scaleX: 4,
        scaleY: 4,
        fill: fillColor,
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        strokeDashArray: strokeDashArray,
      });

      addToCanvas(object);
    },
    addLightning: () => {
      const lightningPath = "M7,2V13H10V22L17,10H13L17,2H7Z";
      
      const object = new fabric.Path(lightningPath, {
        left: 100,
        top: 100,
        scaleX: 4,
        scaleY: 4,
        fill: fillColor,
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        strokeDashArray: strokeDashArray,
      });

      addToCanvas(object);
    },
    addBarChart: () => {
      const group = new fabric.Group([], {
        left: 100,
        top: 100,
      });

      // Create bars
      for (let i = 0; i < 4; i++) {
        const height = 50 + Math.random() * 100;
        const bar = new fabric.Rect({
          left: i * 30,
          top: 150 - height,
          width: 20,
          height: height,
          fill: fillColor,
          stroke: strokeColor,
          strokeWidth: strokeWidth,
        });
        group.addWithUpdate(bar);
      }

      addToCanvas(group);
    },
    addPieChart: () => {
      const group = new fabric.Group([], {
        left: 100,
        top: 100,
      });

      const colors = [fillColor, '#FF6B6B', '#4ECDC4', '#45B7D1'];
      const angles = [90, 120, 80, 70];
      let currentAngle = 0;

      angles.forEach((angle, i) => {
        const slice = new fabric.Path(`M 75 75 L ${75 + 60 * Math.cos(currentAngle * Math.PI / 180)} ${75 + 60 * Math.sin(currentAngle * Math.PI / 180)} A 60 60 0 ${angle > 180 ? 1 : 0} 1 ${75 + 60 * Math.cos((currentAngle + angle) * Math.PI / 180)} ${75 + 60 * Math.sin((currentAngle + angle) * Math.PI / 180)} Z`, {
          fill: colors[i % colors.length],
          stroke: strokeColor,
          strokeWidth: strokeWidth,
        });
        group.addWithUpdate(slice);
        currentAngle += angle;
      });

      addToCanvas(group);
    },
    addLineChart: () => {
      const group = new fabric.Group([], {
        left: 100,
        top: 100,
      });

      const points = [
        { x: 0, y: 100 },
        { x: 50, y: 70 },
        { x: 100, y: 90 },
        { x: 150, y: 40 },
        { x: 200, y: 60 }
      ];

      // Create line
      const pathString = `M ${points[0].x} ${points[0].y} ` + 
        points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
      
      const line = new fabric.Path(pathString, {
        fill: '',
        stroke: fillColor,
        strokeWidth: 3,
      });
      group.addWithUpdate(line);

      // Add points
      points.forEach(point => {
        const circle = new fabric.Circle({
          left: point.x - 3,
          top: point.y - 3,
          radius: 3,
          fill: fillColor,
        });
        group.addWithUpdate(circle);
      });

      addToCanvas(group);
    },
    addDonutChart: () => {
      const group = new fabric.Group([], {
        left: 100,
        top: 100,
      });

      const colors = [fillColor, '#FF6B6B', '#4ECDC4', '#45B7D1'];
      const angles = [90, 120, 80, 70];
      let currentAngle = 0;

      angles.forEach((angle, i) => {
        const slice = new fabric.Path(`M 75 75 L ${75 + 60 * Math.cos(currentAngle * Math.PI / 180)} ${75 + 60 * Math.sin(currentAngle * Math.PI / 180)} A 60 60 0 ${angle > 180 ? 1 : 0} 1 ${75 + 60 * Math.cos((currentAngle + angle) * Math.PI / 180)} ${75 + 60 * Math.sin((currentAngle + angle) * Math.PI / 180)} L ${75 + 30 * Math.cos((currentAngle + angle) * Math.PI / 180)} ${75 + 30 * Math.sin((currentAngle + angle) * Math.PI / 180)} A 30 30 0 ${angle > 180 ? 1 : 0} 0 ${75 + 30 * Math.cos(currentAngle * Math.PI / 180)} ${75 + 30 * Math.sin(currentAngle * Math.PI / 180)} Z`, {
          fill: colors[i % colors.length],
          stroke: strokeColor,
          strokeWidth: strokeWidth,
        });
        group.addWithUpdate(slice);
        currentAngle += angle;
      });

      addToCanvas(group);
    },
    addArrowUp: () => {
      const arrowPath = "M7 14l5-5 5 5z";
      const object = new fabric.Path(arrowPath, {
        left: 100,
        top: 100,
        scaleX: 6,
        scaleY: 6,
        fill: fillColor,
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        strokeDashArray: strokeDashArray,
      });
      addToCanvas(object);
    },
    addArrowDown: () => {
      const arrowPath = "M7 10l5 5 5-5z";
      const object = new fabric.Path(arrowPath, {
        left: 100,
        top: 100,
        scaleX: 6,
        scaleY: 6,
        fill: fillColor,
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        strokeDashArray: strokeDashArray,
      });
      addToCanvas(object);
    },
    addArrowLeft: () => {
      const arrowPath = "M14 7l-5 5 5 5z";
      const object = new fabric.Path(arrowPath, {
        left: 100,
        top: 100,
        scaleX: 6,
        scaleY: 6,
        fill: fillColor,
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        strokeDashArray: strokeDashArray,
      });
      addToCanvas(object);
    },
    addArrowRight: () => {
      const arrowPath = "M10 7l5 5-5 5z";
      const object = new fabric.Path(arrowPath, {
        left: 100,
        top: 100,
        scaleX: 6,
        scaleY: 6,
        fill: fillColor,
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        strokeDashArray: strokeDashArray,
      });
      addToCanvas(object);
    },
    addSun: () => {
      const sunPath = "M12 2v2m0 16v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M2 12h2m16 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M12 7a5 5 0 100 10 5 5 0 000-10z";
      const object = new fabric.Path(sunPath, {
        left: 100,
        top: 100,
        scaleX: 4,
        scaleY: 4,
        fill: fillColor,
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        strokeDashArray: strokeDashArray,
      });
      addToCanvas(object);
    },
    addMoon: () => {
      const moonPath = "M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z";
      const object = new fabric.Path(moonPath, {
        left: 100,
        top: 100,
        scaleX: 4,
        scaleY: 4,
        fill: fillColor,
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        strokeDashArray: strokeDashArray,
      });
      addToCanvas(object);
    },
    addCloud: () => {
      const cloudPath = "M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z";
      const object = new fabric.Path(cloudPath, {
        left: 100,
        top: 100,
        scaleX: 4,
        scaleY: 4,
        fill: fillColor,
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        strokeDashArray: strokeDashArray,
      });
      addToCanvas(object);
    },
    addFlower: () => {
      const flowerPath = "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z";
      const object = new fabric.Path(flowerPath, {
        left: 100,
        top: 100,
        scaleX: 4,
        scaleY: 4,
        fill: fillColor,
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        strokeDashArray: strokeDashArray,
      });
      addToCanvas(object);
    },
    addLeaf: () => {
      const leafPath = "M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z";
      const object = new fabric.Path(leafPath, {
        left: 100,
        top: 100,
        scaleX: 3,
        scaleY: 3,
        fill: fillColor,
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        strokeDashArray: strokeDashArray,
      });
      addToCanvas(object);
    },
    getActiveFontWeight: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return FONT_WEIGHT;
      }

      // @ts-ignore
      // Faulty TS library, fontWeight exists.
      const value = selectedObject.get("fontWeight") || FONT_WEIGHT;

      return value;
    },
    getActiveFontFamily: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return fontFamily;
      }

      // @ts-ignore
      // Try to get original font name first, fallback to fontFamily
      const originalFont = selectedObject.get("originalFontFamily");
      if (originalFont) {
        return originalFont;
      }
      
      // @ts-ignore
      // Faulty TS library, fontFamily exists.
      const value = selectedObject.get("fontFamily") || fontFamily;
      
      // Extract font name from font stack if needed
      if (typeof value === 'string' && value.includes(',')) {
        return value.split(',')[0].trim().replace(/["']/g, '');
      }

      return value;
    },
    getActiveFillColor: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return fillColor;
      }

      const value = selectedObject.get("fill") || fillColor;

      // If it's a gradient, return the first color for compatibility
      if (value && typeof value === "object" && (value as any).colorStops) {
        return (value as any).colorStops[0]?.color || fillColor;
      }

      return value as string;
    },
    getActiveStrokeColor: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return strokeColor;
      }

      const value = selectedObject.get("stroke") || strokeColor;

      return value;
    },
    getActiveStrokeWidth: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return strokeWidth;
      }

      const value = selectedObject.get("strokeWidth") || strokeWidth;

      return value;
    },
    getActiveStrokeDashArray: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return strokeDashArray;
      }

      const value = selectedObject.get("strokeDashArray") || strokeDashArray;

      return value;
    },
    getActiveBorderRadius: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return 0;
      }

      // @ts-ignore
      const value = selectedObject.get("rx") || 0;
      return value;
    },
    changeBorderRadius: (value: number) => {
      canvas.getActiveObjects().forEach((object) => {
        if (object.type === "rect") {
          // @ts-ignore
          object.set({ rx: value, ry: value });
        }
      });
      canvas.renderAll();
    },
    getActiveShadow: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return null;
      }

      return selectedObject.shadow || null;
    },
    changeShadow: (shadow: any) => {
      canvas.getActiveObjects().forEach((object) => {
        if (shadow) {
          object.set({ shadow: new fabric.Shadow(shadow) });
        } else {
          object.set({ shadow: undefined });
        }
      });
      canvas.renderAll();
    },
    getActiveBackground: () => {
      const workspace = getWorkspace();
      if (!workspace) {
        return { type: "transparent", color: "#ffffff", pattern: "none", opacity: 1 };
      }
      
      const fill = workspace.get("fill");
      if (fill === "transparent") {
        return { type: "transparent", color: "#ffffff", pattern: "none", opacity: 1 };
      } else if (typeof fill === "string") {
        return { type: "color", color: fill, pattern: "none", opacity: 1 };
      } else {
        return { type: "transparent", color: "#ffffff", pattern: "none", opacity: 1 };
      }
    },
    changeBackground: (background: any) => {
      const workspace = ensureWorkspaceExists();
      if (!workspace) {
        console.warn("Cannot change background: workspace not available");
        return;
      }
      console.log("Changing background to:", background);
      
      if (background.type === "color") {
        workspace.set({ fill: background.color });
        // Don't set canvas.backgroundColor, let workspace handle it
        console.log("Applied color background:", background.color);
      } else if (background.type === "transparent") {
        workspace.set({ fill: "transparent" });
        // For transparent, we can set canvas background to null or transparent
        console.log("Applied transparent background");
      } else if (background.type === "pattern") {
        // Create pattern background
        const patternCanvas = document.createElement('canvas');
        const patternCtx = patternCanvas.getContext('2d');
        patternCanvas.width = 20;
        patternCanvas.height = 20;
        
        if (patternCtx) {
          patternCtx.fillStyle = background.color || '#ffffff';
          patternCtx.fillRect(0, 0, 20, 20);
          
          // Draw pattern based on type
          patternCtx.strokeStyle = '#e5e7eb';
          patternCtx.lineWidth = 1;
          
          switch (background.pattern) {
            case 'dots':
              patternCtx.fillStyle = '#e5e7eb';
              patternCtx.beginPath();
              patternCtx.arc(10, 10, 2, 0, Math.PI * 2);
              patternCtx.fill();
              break;
            case 'grid':
              patternCtx.beginPath();
              patternCtx.moveTo(0, 20);
              patternCtx.lineTo(20, 20);
              patternCtx.moveTo(20, 0);
              patternCtx.lineTo(20, 20);
              patternCtx.stroke();
              break;
            case 'lines':
              patternCtx.beginPath();
              patternCtx.moveTo(0, 10);
              patternCtx.lineTo(20, 10);
              patternCtx.stroke();
              break;
            case 'diagonal':
              patternCtx.beginPath();
              patternCtx.moveTo(0, 0);
              patternCtx.lineTo(20, 20);
              patternCtx.stroke();
              break;
            case 'checkerboard':
              patternCtx.fillStyle = '#f3f4f6';
              patternCtx.fillRect(0, 0, 10, 10);
              patternCtx.fillRect(10, 10, 10, 10);
              break;
          }
          
          const pattern = patternCtx.createPattern(patternCanvas, 'repeat');
          if (pattern) {
            workspace.set({ fill: pattern as any });
            console.log("Applied pattern background:", background.pattern);
          }
        }
      } else if (background.type === "image" && background.imageUrl) {
        // Create image background
        fabric.Image.fromURL(background.imageUrl, (img) => {
          if (img) {
            // Scale image to fit workspace while maintaining aspect ratio
            const workspaceWidth = workspace.width || 900;
            const workspaceHeight = workspace.height || 1200;
            
            // Calculate scale to cover the entire workspace
            const scaleX = workspaceWidth / (img.width || 1);
            const scaleY = workspaceHeight / (img.height || 1);
            const scale = Math.max(scaleX, scaleY);
            
            img.set({
              scaleX: scale,
              scaleY: scale,
              originX: 'center',
              originY: 'center'
            });
            
            // Create pattern from scaled image
            const patternCanvas = document.createElement('canvas');
            const patternCtx = patternCanvas.getContext('2d');
            
            if (patternCtx) {
              patternCanvas.width = workspaceWidth;
              patternCanvas.height = workspaceHeight;
              
              // Draw the scaled image centered
              const scaledWidth = (img.width || 0) * scale;
              const scaledHeight = (img.height || 0) * scale;
              const offsetX = (workspaceWidth - scaledWidth) / 2;
              const offsetY = (workspaceHeight - scaledHeight) / 2;
              
              const imgElement = img.getElement() as HTMLImageElement;
              patternCtx.drawImage(
                imgElement,
                offsetX,
                offsetY,
                scaledWidth,
                scaledHeight
              );
              
              const pattern = patternCtx.createPattern(patternCanvas, 'no-repeat');
              if (pattern) {
                workspace.set({ fill: pattern as any });
                console.log("Applied image background:", background.imageUrl);
              }
            }
          }
        }, { crossOrigin: 'anonymous' });
      }
      
      // Force workspace visibility and keep it as background
      workspace.set({ 
        visible: true, 
        opacity: background.opacity || 1,
        selectable: false,
        evented: false
      });
      canvas.sendToBack(workspace);
      
      // Safe render with error handling
      try {
        canvas.renderAll();
      } catch (error) {
        console.warn("Canvas render error during background change:", error);
      }
      
      console.log("Background applied. Workspace fill:", workspace.get("fill"));
    },
    getActiveGradient: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return {
          type: "linear",
          angle: 45,
          stops: [
            { color: "#667eea", position: 0, opacity: 1 },
            { color: "#764ba2", position: 100, opacity: 1 }
          ]
        };
      }

      // Extract gradient data from fabric object if it exists
      const fill = selectedObject.get("fill");
      if (fill && typeof fill === "object" && (fill as any).type) {
        const gradient = fill as any;
        const stops = gradient.colorStops?.map((stop: any, index: number) => ({
          color: stop.color,
          position: stop.offset * 100,
          opacity: stop.opacity || 1
        })) || [
          { color: "#667eea", position: 0, opacity: 1 },
          { color: "#764ba2", position: 100, opacity: 1 }
        ];

        return {
          type: gradient.type || "linear",
          angle: gradient.gradientMeta?.angle || gradient.angle || 45,
          stops
        };
      }

      // Default gradient for non-gradient fills
      return {
        type: "linear",
        angle: 45,
        stops: [
          { color: "#667eea", position: 0, opacity: 1 },
          { color: "#764ba2", position: 100, opacity: 1 }
        ]
      };
    },
    changeGradient: (gradient: any) => {
      canvas.getActiveObjects().forEach((object) => {
        let fabricGradient;
        
        if (gradient.type === "linear") {
          // Calculate coordinates based on angle
          const angleRad = (gradient.angle * Math.PI) / 180;
          const objectWidth = object.width || 100;
          const objectHeight = object.height || 100;
          
          // Calculate end points for the gradient based on angle
          const centerX = objectWidth / 2;
          const centerY = objectHeight / 2;
          const radius = Math.sqrt(centerX * centerX + centerY * centerY);
          
          const x1 = centerX - Math.cos(angleRad) * radius;
          const y1 = centerY - Math.sin(angleRad) * radius;
          const x2 = centerX + Math.cos(angleRad) * radius;
          const y2 = centerY + Math.sin(angleRad) * radius;
          
          fabricGradient = new fabric.Gradient({
            type: "linear",
            coords: { x1, y1, x2, y2 },
            colorStops: gradient.stops.map((stop: any) => {
              const opacity = stop.opacity !== undefined ? stop.opacity : 1;
              return {
                offset: stop.position / 100,
                color: stop.color,
                opacity: opacity
              };
            })
          });
        } else if (gradient.type === "radial") {
          const objectWidth = object.width || 100;
          const objectHeight = object.height || 100;
          const centerX = objectWidth / 2;
          const centerY = objectHeight / 2;
          const radius = Math.min(centerX, centerY);
          
          fabricGradient = new fabric.Gradient({
            type: "radial",
            coords: {
              x1: centerX,
              y1: centerY,
              x2: centerX,
              y2: centerY,
              r1: 0,
              r2: radius
            },
            colorStops: gradient.stops.map((stop: any) => {
              const opacity = stop.opacity !== undefined ? stop.opacity : 1;
              return {
                offset: stop.position / 100,
                color: stop.color,
                opacity: opacity
              };
            })
          });
        } else {
          // For conic gradients, fall back to linear for now as fabric.js doesn't support conic
          // We'll create a multi-stop linear gradient as approximation
          const angleRad = (gradient.angle * Math.PI) / 180;
          const objectWidth = object.width || 100;
          const objectHeight = object.height || 100;
          
          const centerX = objectWidth / 2;
          const centerY = objectHeight / 2;
          const radius = Math.sqrt(centerX * centerX + centerY * centerY);
          
          const x1 = centerX - Math.cos(angleRad) * radius;
          const y1 = centerY - Math.sin(angleRad) * radius;
          const x2 = centerX + Math.cos(angleRad) * radius;
          const y2 = centerY + Math.sin(angleRad) * radius;
          
          fabricGradient = new fabric.Gradient({
            type: "linear",
            coords: { x1, y1, x2, y2 },
            colorStops: gradient.stops.map((stop: any) => {
              const opacity = stop.opacity !== undefined ? stop.opacity : 1;
              return {
                offset: stop.position / 100,
                color: stop.color,
                opacity: opacity
              };
            })
          });
        }
        
        // Store gradient metadata for retrieval
        (fabricGradient as any).gradientMeta = {
          type: gradient.type,
          angle: gradient.angle,
          stops: gradient.stops
        };
        
        object.set({ fill: fabricGradient });
      });
      canvas.renderAll();
    },
    getActiveDrawSettings: () => {
      return {
        brushType: "pen",
        color: strokeColor,
        size: strokeWidth,
        opacity: 1,
        smoothing: true,
        pressureSensitive: false,
      };
    },
    changeDrawSettings: (settings: any) => {
      if (settings.brushType === "eraser") {
        // Disable free drawing mode for eraser
        canvas.isDrawingMode = false;
        
        // Store eraser state
        (canvas as any)._isEraserMode = true;
        (canvas as any)._eraserSize = settings.size || 10;
        
        // Add mouse event listeners for erasing
        const handleMouseDown = (e: any) => {
          if (!(canvas as any)._isEraserMode) return;
          (canvas as any)._isErasing = true;
          eraseAtPoint(e.pointer);
        };
        
        const handleMouseMove = (e: any) => {
          if (!(canvas as any)._isEraserMode || !(canvas as any)._isErasing) return;
          eraseAtPoint(e.pointer);
        };
        
        const handleMouseUp = () => {
          (canvas as any)._isErasing = false;
        };
        
        const eraseAtPoint = (pointer: any) => {
          const objects = canvas.getObjects();
          const eraserSize = (canvas as any)._eraserSize;
          
          objects.forEach((obj: any) => {
            if (obj.type === 'path' && obj.name !== 'workspace') {
              const objBounds = obj.getBoundingRect();
              const objCenter = {
                x: objBounds.left + objBounds.width / 2,
                y: objBounds.top + objBounds.height / 2
              };
              
              const distance = Math.sqrt(
                Math.pow(pointer.x - objCenter.x, 2) +
                Math.pow(pointer.y - objCenter.y, 2)
              );
              
              if (distance < eraserSize / 2) {
                canvas.remove(obj);
              }
            }
          });
          
          canvas.renderAll();
        };
        
        // Remove existing listeners
        canvas.off('mouse:down', (canvas as any)._eraserMouseDown);
        canvas.off('mouse:move', (canvas as any)._eraserMouseMove);
        canvas.off('mouse:up', (canvas as any)._eraserMouseUp);
        
        // Add new listeners
        (canvas as any)._eraserMouseDown = handleMouseDown;
        (canvas as any)._eraserMouseMove = handleMouseMove;
        (canvas as any)._eraserMouseUp = handleMouseUp;
        
        canvas.on('mouse:down', handleMouseDown);
        canvas.on('mouse:move', handleMouseMove);
        canvas.on('mouse:up', handleMouseUp);
        
      } else {
        // Normal drawing mode
        (canvas as any)._isEraserMode = false;
        canvas.isDrawingMode = true;
        canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
        
        // Remove eraser event listeners
        canvas.off('mouse:down', (canvas as any)._eraserMouseDown);
        canvas.off('mouse:move', (canvas as any)._eraserMouseMove);
        canvas.off('mouse:up', (canvas as any)._eraserMouseUp);
        
        if (settings.color) {
          setStrokeColor(settings.color);
          canvas.freeDrawingBrush.color = settings.color;
        }
        if (settings.size) {
          setStrokeWidth(settings.size);
          canvas.freeDrawingBrush.width = settings.size;
        }
      }
      
      // Apply other settings
      if (settings.color && settings.brushType !== "eraser") {
        setStrokeColor(settings.color);
        canvas.freeDrawingBrush.color = settings.color;
      }
      if (settings.size) {
        if (settings.brushType === "eraser") {
          (canvas as any)._eraserSize = settings.size;
        } else {
          setStrokeWidth(settings.size);
          canvas.freeDrawingBrush.width = settings.size;
        }
      }
      
      canvas.renderAll();
    },
    clearDrawing: () => {
      const objects = canvas.getObjects().filter(obj => obj.type === "path");
      objects.forEach(obj => canvas.remove(obj));
      canvas.renderAll();
    },
    undoDrawing: () => {
      const objects = canvas.getObjects().filter(obj => obj.type === "path");
      if (objects.length > 0) {
        canvas.remove(objects[objects.length - 1]);
        canvas.renderAll();
      }
    },
    addEmoji: (emoji: string) => {
      const object = new fabric.Text(emoji, {
        left: 100,
        top: 100,
        fontSize: 100,
        fontFamily: "Arial",
      });

      addToCanvas(object);
    },
    canvas,
    selectedObjects,
  };
};

export const useEditor = ({
  defaultState,
  defaultHeight,
  defaultWidth,
  clearSelectionCallback,
  saveCallback,
}: EditorHookProps) => {
  const initialState = useRef(defaultState);
  const initialWidth = useRef(defaultWidth);
  const initialHeight = useRef(defaultHeight);

  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [selectedObjects, setSelectedObjects] = useState<fabric.Object[]>([]);

  const [fontFamily, setFontFamily] = useState(FONT_FAMILY);
  const [fillColor, setFillColor] = useState(FILL_COLOR);
  const [strokeColor, setStrokeColor] = useState(STROKE_COLOR);
  const [strokeWidth, setStrokeWidth] = useState(STROKE_WIDTH);
  const [strokeDashArray, setStrokeDashArray] = useState<number[]>(STROKE_DASH_ARRAY);

  useWindowEvents();

  const { 
    save, 
    canRedo, 
    canUndo, 
    undo, 
    redo,
    canvasHistory,
    setHistoryIndex,
  } = useHistory({ 
    canvas,
    saveCallback
  });

  const { copy, paste } = useClipboard({ canvas });

  const { autoZoom } = useAutoResize({
    canvas,
    container,
  });

  useCanvasEvents({
    save,
    canvas,
    setSelectedObjects,
    clearSelectionCallback,
  });

  useHotkeys({
    undo,
    redo,
    copy,
    paste,
    save,
    canvas,
  });

  useLoadState({
    canvas,
    autoZoom,
    initialState,
    canvasHistory,
    setHistoryIndex,
  });

  const editor = useMemo(() => {
    if (canvas) {
      return buildEditor({
        save,
        undo,
        redo,
        canUndo,
        canRedo,
        autoZoom,
        copy,
        paste,
        canvas,
        fillColor,
        strokeWidth,
        strokeColor,
        setFillColor,
        setStrokeColor,
        setStrokeWidth,
        strokeDashArray,
        selectedObjects,
        setStrokeDashArray,
        fontFamily,
        setFontFamily,
      });
    }

    return undefined;
  }, 
  [
    canRedo,
    canUndo,
    undo,
    redo,
    save,
    autoZoom,
    copy,
    paste,
    canvas,
    fillColor,
    strokeWidth,
    strokeColor,
    selectedObjects,
    strokeDashArray,
    fontFamily,
  ]);

  const init = useCallback(
    ({
      initialCanvas,
      initialContainer,
    }: {
      initialCanvas: fabric.Canvas;
      initialContainer: HTMLDivElement;
    }) => {
      fabric.Object.prototype.set({
        cornerColor: "#FFF",
        cornerStyle: "circle",
        borderColor: "#3b82f6",
        borderScaleFactor: 1.5,
        transparentCorners: false,
        borderOpacityWhenMoving: 1,
        cornerStrokeColor: "#3b82f6",
      });

      // Ensure container is available before accessing dimensions
      if (!initialContainer) {
        console.error('Container not available during canvas initialization');
        return;
      }

      const containerWidth = initialContainer.offsetWidth || 800;
      const containerHeight = initialContainer.offsetHeight || 600;

      initialCanvas.setWidth(containerWidth);
      initialCanvas.setHeight(containerHeight);

      const initialWorkspace = new fabric.Rect({
        width: initialWidth.current,
        height: initialHeight.current,
        name: "clip",
        fill: "white",
        selectable: false,
        hasControls: false,
        evented: false,
        hoverCursor: "default",
        moveCursor: "default",
        visible: true,
        opacity: 1,
        stroke: "#e5e7eb",
        strokeWidth: 1,
        shadow: new fabric.Shadow({
          color: "rgba(0,0,0,0.8)",
          blur: 5,
        }),
      });

      initialCanvas.add(initialWorkspace);
      initialCanvas.centerObject(initialWorkspace);
      
      // Add workspace as a visible background object, not clipPath
      // clipPath makes the workspace invisible, preventing background color changes
      initialCanvas.renderAll();

      setCanvas(initialCanvas);
      setContainer(initialContainer);

      const currentState = JSON.stringify(
        initialCanvas.toJSON(JSON_KEYS)
      );
      canvasHistory.current = [currentState];
      setHistoryIndex(0);
    },
    [
      canvasHistory, // No need, this is from useRef
      setHistoryIndex, // No need, this is from useState
    ]
  );

  return { init, editor };
};
