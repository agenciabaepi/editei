"use client";

import { useState, DragEvent } from "react";
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  Copy, 
  MoreHorizontal,
  GripVertical,
  Layers,
  ChevronDown,
  ChevronUp
} from "lucide-react";

import { Editor } from "@/features/editor/types";
import { useLayers } from "@/features/editor/hooks/use-layers";
import { Layer } from "@/features/editor/types/layers";

import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface FixedLayersPanelProps {
  editor: Editor | undefined;
}

interface LayerItemProps {
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

const LayerItem = ({
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
}: LayerItemProps) => {
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
      <div className="cursor-grab active:cursor-grabbing opacity-40 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <GripVertical className="h-3 w-3 text-muted-foreground" />
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
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0"
          onClick={(e) => {
            e.stopPropagation();
            onToggleVisibility();
          }}
          title={layer.visible ? "Hide layer" : "Show layer"}
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
          title={layer.locked ? "Unlock layer" : "Lock layer"}
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

export const FixedLayersPanel = ({
  editor,
}: FixedLayersPanelProps) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

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

  return (
    <div className="fixed right-0 top-[68px] bottom-0 z-30 w-56 border-l border-gray-200 bg-white shadow-sm">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            <span className="font-medium text-sm">Layers</span>
            <span className="text-xs text-muted-foreground">
              ({layerManager.layers.length})
            </span>
          </div>
          
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
        </div>

        {/* Layers List */}
        {isExpanded && (
          <ScrollArea className="flex-1 p-2 min-h-0">
            {layerManager.layers.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <div className="text-2xl mb-2">📄</div>
                <p className="text-xs">No layers yet</p>
                <p className="text-xs opacity-70">Add elements to see layers</p>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {layerManager.layers.map((layer, index) => (
                  <LayerItem
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
          </ScrollArea>
        )}
      </div>
    </div>
  );
};

