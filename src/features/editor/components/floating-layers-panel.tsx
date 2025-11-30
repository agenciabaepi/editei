"use client";

import { useState, useRef, DragEvent } from "react";
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
  X
} from "lucide-react";

import { Editor } from "@/features/editor/types";
import { useLayers } from "@/features/editor/hooks/use-layers";
import { Layer } from "@/features/editor/types/layers";

import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface FloatingLayersPanelProps {
  editor: Editor | undefined;
  isVisible: boolean;
  onToggle: () => void;
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
      {/* Drag Handle */}
      <div className="cursor-grab active:cursor-grabbing opacity-40 group-hover:opacity-100 transition-opacity">
        <GripVertical className="h-3 w-3" />
      </div>

      {/* Thumbnail */}
      <div className="w-8 h-8 bg-muted rounded flex items-center justify-center text-xs overflow-hidden flex-shrink-0">
        {layer.thumbnail ? (
          <img src={layer.thumbnail} alt={layer.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-sm">{getLayerIcon()}</span>
        )}
      </div>

      {/* Layer Info */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate">{layer.name}</p>
        <p className="text-xs text-muted-foreground capitalize opacity-70">{layer.type}</p>
      </div>

      {/* Controls */}
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

export const FloatingLayersPanel = ({
  editor,
  isVisible,
  onToggle,
}: FloatingLayersPanelProps) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const dragCounter = useRef(0);

  const layerManager = useLayers({
    canvas: editor?.canvas,
    onLayerChange: (layers) => {
      console.log('Layers updated:', layers);
    }
  });

  const handleDragStart = (e: DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', index.toString());
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    dragCounter.current = 0;
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

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 min-w-[600px] max-w-[800px]">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            <span className="font-medium text-sm">Layers</span>
            <span className="text-xs text-muted-foreground">
              ({layerManager.layers.length})
            </span>
          </div>
          
          <div className="flex items-center gap-1">
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
              onClick={onToggle}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Layers List */}
        {isExpanded && (
          <div className="p-2 max-h-[200px] overflow-y-auto">
            {layerManager.layers.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <div className="text-2xl mb-2">📄</div>
                <p className="text-xs">No layers yet</p>
                <p className="text-xs opacity-70">Add elements to see layers</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-1">
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
        )}
      </div>
    </div>
  );
};
