"use client";

import { useState, useRef, DragEvent, MouseEvent, useEffect } from "react";
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  Copy, 
  MoreHorizontal,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Layers,
  X,
  Settings,
  Move
} from "lucide-react";

import { Editor } from "@/features/editor/types";
import { useLayers } from "@/features/editor/hooks/use-layers";
import { Layer } from "@/features/editor/types/layers";
import { LayersPanelPosition } from "@/features/editor/types/layers-position";

import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface DraggableLayersPanelProps {
  editor: Editor | undefined;
  position: LayersPanelPosition;
  onPositionChange: (position: LayersPanelPosition) => void;
  onClose: () => void;
}

interface DraggableLayerItemProps {
  layer: Layer;
  index: number;
  isSelected: boolean;
  isDragging: boolean;
  onSelect: () => void;
  onToggleVisibility: () => void;
  onToggleLock: () => void;
  onDuplicate: () => void;
  onDragStart: (e: DragEvent, index: number) => void;
  onDragEnd: () => void;
  onDragOver: (e: DragEvent) => void;
  onDrop: (e: DragEvent, dropIndex: number) => void;
}

const DraggableLayerItem = ({
  layer,
  index,
  isSelected,
  isDragging,
  onSelect,
  onToggleVisibility,
  onToggleLock,
  onDuplicate,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop
}: DraggableLayerItemProps) => {
  const getLayerIcon = () => {
    switch (layer.type) {
      case 'text':
        return '📝';
      case 'image':
        return '🖼️';
      case 'shape':
        return '🔷';
      case 'group':
        return '📁';
      case 'background':
        return '🎨';
      default:
        return '📄';
    }
  };

  return (
    <div 
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, index)}
      className={cn(
        "group flex items-center gap-2 p-2 rounded-md cursor-pointer border transition-all duration-200",
        isSelected && "bg-blue-50 border-blue-200 shadow-sm",
        !isSelected && "border-transparent hover:bg-muted/50",
        isDragging && "opacity-50 scale-95",
        !layer.visible && "opacity-60"
      )}
      onClick={onSelect}
    >
      <div className="cursor-grab active:cursor-grabbing opacity-40 group-hover:opacity-100 transition-opacity">
        <GripVertical className="h-3 w-3" />
      </div>
      
      <div className="w-8 h-8 bg-muted rounded flex items-center justify-center text-xs overflow-hidden flex-shrink-0">
        {layer.thumbnail ? (
          <img src={layer.thumbnail} alt={layer.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-sm">{getLayerIcon()}</span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate">{layer.name}</p>
        <p className="text-xs text-muted-foreground capitalize">{layer.type}</p>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0"
          onClick={(e) => {
            e.stopPropagation();
            onToggleVisibility();
          }}
        >
          {layer.visible ? (
            <Eye className="h-3 w-3" />
          ) : (
            <EyeOff className="h-3 w-3 text-muted-foreground" />
          )}
        </Button>

        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0"
          onClick={(e) => {
            e.stopPropagation();
            onToggleLock();
          }}
        >
          {layer.locked ? (
            <Lock className="h-3 w-3 text-muted-foreground" />
          ) : (
            <Unlock className="h-3 w-3" />
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onDuplicate}>
              <Copy className="h-3 w-3 mr-2" />
              Duplicate
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export const DraggableLayersPanel = ({
  editor,
  position,
  onPositionChange,
  onClose
}: DraggableLayersPanelProps) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDraggingPanel, setIsDraggingPanel] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  const panelRef = useRef<HTMLDivElement>(null);

  const layerManager = useLayers({
    canvas: editor?.canvas,
    onLayerChange: (layers) => {
      console.log('Layers updated:', layers);
    }
  });

  const getPositionClasses = () => {
    switch (position) {
      case "floating-bottom":
        return "bottom-4 left-1/2 transform -translate-x-1/2";
      case "floating-top":
        return "top-20 left-1/2 transform -translate-x-1/2";
      case "floating-left":
        return "left-4 top-1/2 transform -translate-y-1/2";
      case "floating-right":
        return "right-4 top-1/2 transform -translate-y-1/2";
      case "floating-custom":
        return "transform-none";
      default:
        return "bottom-4 left-1/2 transform -translate-x-1/2";
    }
  };

  const getSizeClasses = () => {
    if (position === "floating-left" || position === "floating-right") {
      return isExpanded ? "w-80 max-h-[500px] min-h-[200px]" : "w-80 h-12";
    }
    return isExpanded ? "min-w-[600px] max-w-[800px] max-h-[400px] min-h-[200px]" : "min-w-[300px] h-12";
  };

  // Panel dragging functionality
  const handlePanelMouseDown = (e: MouseEvent) => {
    if (!panelRef.current) return;
    
    // Prevent dragging from interfering with canvas
    e.preventDefault();
    e.stopPropagation();
    
    const rect = panelRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setIsDraggingPanel(true);
  };

  const handlePanelMouseMove = (e: MouseEvent) => {
    if (!isDraggingPanel || !panelRef.current) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;

    // Keep panel within viewport bounds
    const maxX = window.innerWidth - panelRef.current.offsetWidth;
    const maxY = window.innerHeight - panelRef.current.offsetHeight;

    const clampedX = Math.max(0, Math.min(newX, maxX));
    const clampedY = Math.max(0, Math.min(newY, maxY));

    // Update panel position directly via CSS
    panelRef.current.style.left = `${clampedX}px`;
    panelRef.current.style.top = `${clampedY}px`;
    panelRef.current.style.transform = 'none';
    
    // Set to custom position type
    onPositionChange("floating-custom");
  };

  const handlePanelMouseUp = () => {
    setIsDraggingPanel(false);
  };

  useEffect(() => {
    if (isDraggingPanel) {
      const handleMouseMove = (e: any) => handlePanelMouseMove(e);
      const handleMouseUp = () => handlePanelMouseUp();
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDraggingPanel, dragOffset, handlePanelMouseMove]);

  // Layer dragging functionality
  const handleDragStart = (e: DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', index.toString());
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) return;
    
    layerManager.reorderLayers(draggedIndex, dropIndex);
    setDraggedIndex(null);
  };

  // Show loading state if editor or canvas is not available
  if (!editor || !editor.canvas) {
    return (
      <div 
        ref={panelRef}
        className={cn(
          "fixed bg-white border border-gray-200 rounded-lg shadow-lg transition-all duration-200 z-50 flex flex-col",
          getPositionClasses(),
          getSizeClasses()
        )}
      >
        <div className="flex items-center justify-between p-3 border-b bg-gray-50 rounded-t-lg">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            <span className="text-sm font-medium">Layers</span>
          </div>
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-6 w-6 p-0"
            onClick={onClose}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
        <div className="p-4 text-center text-muted-foreground">
          <div className="text-2xl mb-2">⏳</div>
          <p className="text-sm">Loading canvas...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={panelRef}
      className={cn(
        "fixed bg-white border border-gray-200 rounded-lg shadow-lg transition-all duration-200 z-50 flex flex-col",
        getPositionClasses(),
        getSizeClasses(),
        isDraggingPanel && "cursor-grabbing select-none"
      )}
    >
      {/* Header */}
      <div 
        className={cn(
          "flex items-center justify-between p-3 border-b bg-gray-50 rounded-t-lg",
          "cursor-grab active:cursor-grabbing"
        )}
        onMouseDown={handlePanelMouseDown}
      >
        <div className="flex items-center gap-2">
          <Move className="h-4 w-4 text-muted-foreground" />
          <Layers className="h-4 w-4" />
          <span className="text-sm font-medium">Layers</span>
          <span className="text-xs text-muted-foreground">({layerManager.layers.length})</span>
        </div>
        
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Position Settings */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0 flex-shrink-0">
                <Settings className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onPositionChange("floating-bottom")}>
                Bottom
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onPositionChange("floating-top")}>
                Top
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onPositionChange("floating-left")}>
                Left
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onPositionChange("floating-right")}>
                Right
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onPositionChange("sidebar-left")}>
                Left Sidebar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onPositionChange("sidebar-right")}>
                Right Sidebar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-6 w-6 p-0"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronUp className="h-3 w-3" />
            )}
          </Button>
          
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-6 w-6 p-0"
            onClick={onClose}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Layers List */}
      {isExpanded && (
        <div className="flex flex-col flex-1 min-h-0">
          <div className="p-2 overflow-y-auto flex-1 min-h-0">
            {layerManager.layers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <div className="text-2xl mb-2">📄</div>
                <p className="text-sm">No layers yet</p>
                <p className="text-xs">Add elements to see layers</p>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {layerManager.layers.map((layer, index) => (
                  <DraggableLayerItem
                    key={layer.id}
                    layer={layer}
                    index={index}
                    isSelected={layerManager.selectedLayerId === layer.id}
                    isDragging={draggedIndex === index}
                    onSelect={() => layerManager.selectLayer(layer.id)}
                    onToggleVisibility={() => layerManager.toggleVisibility(layer.id)}
                    onToggleLock={() => layerManager.toggleLock(layer.id)}
                    onDuplicate={() => layerManager.duplicateLayer(layer.id)}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
