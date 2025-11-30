import { useState, useCallback, useEffect, useRef } from "react";
import { fabric } from "fabric";
import { v4 as uuidv4 } from "uuid";
import { Layer, LayerType, LayerManagerState, LayerManagerActions } from "../types/layers";

// Extend fabric.Object to include id property
interface FabricObjectWithId extends fabric.Object {
  id?: string;
}

interface UseLayersProps {
  canvas?: fabric.Canvas;
  onLayerChange?: (layers: Layer[]) => void;
}

export const useLayers = ({ canvas, onLayerChange }: UseLayersProps): LayerManagerState & LayerManagerActions => {
  const [layers, setLayers] = useState<Layer[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [draggedLayerId, setDraggedLayerId] = useState<string | null>(null);

  // Use refs to avoid dependency issues
  const layersRef = useRef<Layer[]>([]);
  const onLayerChangeRef = useRef(onLayerChange);
  
  // Update refs when values change
  useEffect(() => {
    layersRef.current = layers;
  }, [layers]);
  
  useEffect(() => {
    onLayerChangeRef.current = onLayerChange;
  }, [onLayerChange]);

  // Generate layer name based on type
  const generateLayerName = useCallback((type: LayerType, existingNames: string[]): string => {
    const baseNames = {
      text: "Text",
      image: "Image", 
      shape: "Shape",
      group: "Group",
      background: "Background"
    };
    
    const baseName = baseNames[type];
    let counter = 1;
    let name = baseName;
    
    while (existingNames.includes(name)) {
      counter++;
      name = `${baseName} ${counter}`;
    }
    
    return name;
  }, []);

  // Get layer type from fabric object
  const getLayerType = useCallback((obj: fabric.Object): LayerType => {
    if (obj.type === "textbox" || obj.type === "text" || obj.type === "i-text") {
      return "text";
    }
    if (obj.type === "image") {
      return "image";
    }
    if (obj.type === "group") {
      return "group";
    }
    if (obj.name === "clip") {
      return "background";
    }
    return "shape";
  }, []);

  // Generate thumbnail for layer
  const generateThumbnail = useCallback((obj: fabric.Object): string => {
    try {
      const tempCanvas = new fabric.Canvas(document.createElement('canvas'));
      tempCanvas.setDimensions({ width: 60, height: 60 });
      
      const clone = fabric.util.object.clone(obj);
      clone.set({
        left: 30,
        top: 30,
        scaleX: Math.min(50 / (obj.width || 100), 1),
        scaleY: Math.min(50 / (obj.height || 100), 1)
      });
      
      tempCanvas.add(clone);
      const thumbnail = tempCanvas.toDataURL({ format: 'png', quality: 0.8 });
      tempCanvas.dispose();
      
      return thumbnail;
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      return '';
    }
  }, []);

  // Add new layer
  const addLayer = useCallback((fabricObject: fabric.Object, type: LayerType, name?: string): Layer | undefined => {
    if (!canvas) return undefined;

    const existingNames = layers.map(l => l.name);
    const layerName = name || generateLayerName(type, existingNames);
    const fabricObj = fabricObject as FabricObjectWithId;
    
    const newLayer: Layer = {
      id: fabricObj.id || uuidv4(),
      name: layerName,
      type,
      visible: fabricObject.visible !== false,
      locked: !fabricObject.selectable,
      opacity: fabricObject.opacity || 1,
      fabricObject,
      thumbnail: generateThumbnail(fabricObject),
      zIndex: canvas.getObjects().indexOf(fabricObject)
    };

    // Set the ID on the fabric object for future reference
    (fabricObject as any).set('id', newLayer.id);
    
    setLayers(prev => {
      const updated = [...prev, newLayer].sort((a, b) => b.zIndex - a.zIndex);
      onLayerChange?.(updated);
      return updated;
    });

    return newLayer;
  }, [canvas, layers, generateLayerName, generateThumbnail, onLayerChange]);

  // Remove layer
  const removeLayer = useCallback((layerId: string) => {
    if (!canvas) return;

    const layer = layers.find(l => l.id === layerId);
    if (!layer) return;

    // Remove from canvas with error handling
    try {
      canvas.remove(layer.fabricObject);
      // Safe render after removal with canvas validation
      if (canvas.getContext && canvas.getContext()) {
        try {
          canvas.renderAll();
        } catch (renderError) {
          console.warn("Canvas render error after layer removal:", renderError);
        }
      }
    } catch (error) {
      console.warn("Error removing layer from canvas:", error);
    }

    setLayers(prev => {
      const updated = prev.filter(l => l.id !== layerId);
      onLayerChange?.(updated);
      return updated;
    });

    if (selectedLayerId === layerId) {
      setSelectedLayerId(null);
    }
  }, [canvas, layers, selectedLayerId, onLayerChange]);

  // Select layer
  const selectLayer = useCallback((layerId: string) => {
    if (!canvas) return;

    const layer = layers.find(l => l.id === layerId);
    if (!layer || layer.locked) return;

    canvas.setActiveObject(layer.fabricObject);
    canvas.renderAll();
    setSelectedLayerId(layerId);
  }, [canvas, layers]);

  // Toggle visibility
  const toggleVisibility = useCallback((layerId: string) => {
    if (!canvas) return;

    setLayers(prev => prev.map(layer => {
      if (layer.id === layerId) {
        const newVisible = !layer.visible;
        layer.fabricObject.set('visible', newVisible);
        canvas.renderAll();
        return { ...layer, visible: newVisible };
      }
      return layer;
    }));
  }, [canvas]);

  // Toggle lock
  const toggleLock = useCallback((layerId: string) => {
    if (!canvas) return;

    setLayers(prev => prev.map(layer => {
      if (layer.id === layerId) {
        const newLocked = !layer.locked;
        layer.fabricObject.set({
          selectable: !newLocked,
          evented: !newLocked
        });
        canvas.renderAll();
        return { ...layer, locked: newLocked };
      }
      return layer;
    }));
  }, [canvas]);

  // Duplicate layer
  const duplicateLayer = useCallback((layerId: string) => {
    if (!canvas) return;

    const layer = layers.find(l => l.id === layerId);
    if (!layer) return;

    layer.fabricObject.clone((cloned: fabric.Object) => {
      (cloned as any).set({
        left: (cloned.left || 0) + 10,
        top: (cloned.top || 0) + 10,
        id: uuidv4()
      });
      
      canvas.add(cloned);
      addLayer(cloned, layer.type, `${layer.name} copy`);
      canvas.setActiveObject(cloned);
      canvas.renderAll();
    });
  }, [canvas, layers, addLayer]);

  // Rename layer
  const renameLayer = useCallback((layerId: string, newName: string) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, name: newName } : layer
    ));
  }, []);

  // Reorder layers
  const reorderLayers = useCallback((fromIndex: number, toIndex: number) => {
    if (!canvas) return;

    setLayers(prev => {
      const newLayers = [...prev];
      const [moved] = newLayers.splice(fromIndex, 1);
      newLayers.splice(toIndex, 0, moved);

      // Update z-index on canvas
      newLayers.forEach((layer, index) => {
        const canvasIndex = newLayers.length - 1 - index;
        canvas.moveTo(layer.fabricObject, canvasIndex);
        layer.zIndex = canvasIndex;
      });

      canvas.renderAll();
      onLayerChange?.(newLayers);
      return newLayers;
    });
  }, [canvas, onLayerChange]);

  // Refresh layers from canvas
  const refreshLayers = useCallback(() => {
    if (!canvas) return;

    const canvasObjects = canvas.getObjects();
    
    setLayers(prevLayers => {
      const existingLayerIds = new Set(prevLayers.map(l => l.id));
      const newLayers = [...prevLayers];
      
      // Add new objects that don't have layers yet
      canvasObjects.forEach((obj, index) => {
        const fabricObj = obj as FabricObjectWithId;
        if (!fabricObj.id || !existingLayerIds.has(fabricObj.id)) {
          const type = getLayerType(obj);
          const id = fabricObj.id || uuidv4();
          (obj as any).set('id', id);
          
          const newLayer: Layer = {
            id,
            name: generateLayerName(type, prevLayers.map(l => l.name)),
            type,
            visible: obj.visible !== false,
            locked: !obj.selectable,
            opacity: obj.opacity || 1,
            fabricObject: obj,
            thumbnail: generateThumbnail(obj),
            zIndex: index
          };
          
          newLayers.push(newLayer);
        }
      });

      // Update existing layers and filter out removed ones
      const updatedLayers = newLayers.map(layer => {
        const canvasIndex = canvasObjects.indexOf(layer.fabricObject);
        if (canvasIndex >= 0) {
          return {
            ...layer,
            zIndex: canvasIndex,
            visible: layer.fabricObject.visible !== false,
            locked: !layer.fabricObject.selectable,
            opacity: layer.fabricObject.opacity || 1
          };
        }
        return layer;
      }).filter(layer => canvasObjects.includes(layer.fabricObject))
      .sort((a, b) => b.zIndex - a.zIndex);

      return updatedLayers;
    });

  }, [canvas, getLayerType, generateLayerName, generateThumbnail]);

  // Bring to front
  const bringToFront = useCallback((layerId: string) => {
    if (!canvas) return;

    const layer = layers.find(l => l.id === layerId);
    if (!layer) return;

    canvas.bringToFront(layer.fabricObject);
    refreshLayers();
  }, [canvas, layers, refreshLayers]);

  // Send to back
  const sendToBack = useCallback((layerId: string) => {
    if (!canvas) return;

    const layer = layers.find(l => l.id === layerId);
    if (!layer) return;

    canvas.sendToBack(layer.fabricObject);
    refreshLayers();
  }, [canvas, layers, refreshLayers]);

  // Update layer opacity
  const updateLayerOpacity = useCallback((layerId: string, opacity: number) => {
    if (!canvas) return;

    setLayers(prev => prev.map(layer => {
      if (layer.id === layerId) {
        layer.fabricObject.set('opacity', opacity);
        canvas.renderAll();
        return { ...layer, opacity };
      }
      return layer;
    }));
  }, [canvas]);

  // Initialize layers from existing canvas objects - run only once per canvas
  useEffect(() => {
    if (!canvas) return;
    
    let isInitialized = false;
    
    // Initialize layers from existing canvas objects
    const initializeExistingObjects = () => {
      if (isInitialized) return;
      
      const canvasObjects = canvas.getObjects();
      if (canvasObjects.length > 0) {
        const newLayers: Layer[] = [];
        const existingNames: string[] = [];
        
        canvasObjects.forEach((obj, index) => {
          const fabricObj = obj as FabricObjectWithId;
          const layerType = getLayerType(obj);
          const layerName = generateLayerName(layerType, existingNames);
          existingNames.push(layerName);
          
          const layerId = fabricObj.id || uuidv4();
          fabricObj.id = layerId;
          
          const newLayer: Layer = {
            id: layerId,
            name: layerName,
            type: layerType,
            visible: obj.visible !== false,
            locked: !obj.selectable,
            opacity: obj.opacity || 1,
            fabricObject: obj,
            thumbnail: generateThumbnail(obj),
            zIndex: index
          };
          
          newLayers.push(newLayer);
        });
        
        if (newLayers.length > 0) {
          setLayers(newLayers.sort((a, b) => b.zIndex - a.zIndex));
          onLayerChangeRef.current?.(newLayers);
          isInitialized = true;
        }
      }
    };

    // Initialize on mount
    initializeExistingObjects();
    
    const handleObjectAdded = (e: fabric.IEvent) => {
      const obj = e.target as FabricObjectWithId;
      if (obj && !obj.id) {
        setLayers(currentLayers => {
          const existingNames = currentLayers.map(l => l.name);
          const layerType = getLayerType(obj);
          const layerName = generateLayerName(layerType, existingNames);
          const layerId = uuidv4();
          obj.id = layerId;
          
          const newLayer: Layer = {
            id: layerId,
            name: layerName,
            type: layerType,
            visible: obj.visible !== false,
            locked: !obj.selectable,
            opacity: obj.opacity || 1,
            fabricObject: obj,
            thumbnail: generateThumbnail(obj),
            zIndex: canvas.getObjects().indexOf(obj)
          };
          
          const updatedLayers = [...currentLayers, newLayer].sort((a, b) => b.zIndex - a.zIndex);
          onLayerChangeRef.current?.(updatedLayers);
          return updatedLayers;
        });
      }
    };

    const handleObjectRemoved = (e: fabric.IEvent) => {
      const obj = e.target;
      if (obj) {
        setLayers(currentLayers => {
          const updatedLayers = currentLayers.filter(l => l.fabricObject !== obj);
          onLayerChangeRef.current?.(updatedLayers);
          return updatedLayers;
        });
      }
    };

    const handleSelectionCreated = (e: fabric.IEvent) => {
      const obj = e.target;
      if (obj) {
        const layer = layersRef.current.find(l => l.fabricObject === obj);
        if (layer) {
          setSelectedLayerId(layer.id);
        }
      }
    };

    const handleSelectionCleared = () => {
      setSelectedLayerId(null);
    };

    const handleObjectModified = () => {
      setLayers(currentLayers => {
        const canvasObjects = canvas.getObjects();
        const updatedLayers = currentLayers.map(layer => {
          const canvasIndex = canvasObjects.indexOf(layer.fabricObject);
          if (canvasIndex >= 0) {
            return {
              ...layer,
              zIndex: canvasIndex,
              visible: layer.fabricObject.visible !== false,
              locked: !layer.fabricObject.selectable,
              opacity: layer.fabricObject.opacity || 1
            };
          }
          return layer;
        }).filter(layer => canvasObjects.includes(layer.fabricObject))
        .sort((a, b) => b.zIndex - a.zIndex);
        
        return updatedLayers;
      });
    };

    canvas.on('object:added', handleObjectAdded);
    canvas.on('object:removed', handleObjectRemoved);
    canvas.on('object:modified', handleObjectModified);
    canvas.on('selection:created', handleSelectionCreated);
    canvas.on('selection:updated', handleSelectionCreated);
    canvas.on('selection:cleared', handleSelectionCleared);

    return () => {
      canvas.off('object:added', handleObjectAdded);
      canvas.off('object:removed', handleObjectRemoved);
      canvas.off('object:modified', handleObjectModified);
      canvas.off('selection:created', handleSelectionCreated);
      canvas.off('selection:updated', handleSelectionCreated);
      canvas.off('selection:cleared', handleSelectionCleared);
    };
  }, [canvas]);

  return {
    layers,
    selectedLayerId,
    draggedLayerId,
    addLayer,
    removeLayer,
    selectLayer,
    toggleVisibility,
    toggleLock,
    duplicateLayer,
    renameLayer,
    reorderLayers,
    bringToFront,
    sendToBack,
    updateLayerOpacity,
    refreshLayers
  };
};
