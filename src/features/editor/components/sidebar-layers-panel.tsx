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
  Settings
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

interface SidebarLayersPanelProps {
  editor: Editor | undefined;
  side: "left" | "right";
  onPositionChange?: (position: LayersPanelPosition) => void;
}

interface SidebarLayerItemProps {
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

const SidebarLayerItem = ({
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
}: SidebarLayerItemProps) => {
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
        "group flex flex-col gap-1 p-2 rounded-md cursor-pointer border transition-all duration-200",
        isSelected && "bg-blue-50 border-blue-200 shadow-sm",
        !isSelected && "border-transparent hover:bg-muted/50",
        isDragging && "opacity-50 scale-95",
        !layer.visible && "opacity-60"
      )}
      onClick={onSelect}
    >
      {/* Thumbnail and Drag Handle */}
      <div className="flex items-center gap-2">
        <div className="cursor-grab active:cursor-grabbing opacity-40 group-hover:opacity-100 transition-opacity">
          <GripVertical className="h-3 w-3" />
        </div>
        
        <div className="w-10 h-10 bg-muted rounded flex items-center justify-center text-xs overflow-hidden flex-shrink-0">
          {layer.thumbnail ? (
            <img src={layer.thumbnail} alt={layer.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-lg">{getLayerIcon()}</span>
          )}
        </div>
      </div>

      {/* Layer Info */}
      <div className="flex-1 min-w-0 px-1">
        <p className="text-xs font-medium truncate">{layer.name}</p>
        <p className="text-xs text-muted-foreground capitalize opacity-70">{layer.type}</p>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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

export const SidebarLayersPanel = ({
  editor,
  side,
  onPositionChange
}: SidebarLayersPanelProps) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

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
    <div className={cn(
      "bg-white h-full border-gray-200 w-[120px] flex flex-col",
      side === "left" ? "border-r" : "border-l"
    )}>
      {/* Header */}
      <div className="flex flex-col items-center p-2 border-b">
        <div className="flex items-center justify-between w-full mb-1">
          <div className="flex-1" />
          {onPositionChange && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost" className="h-5 w-5 p-0">
                  <Settings className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onPositionChange("floating-bottom")}>
                  Floating Bottom
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onPositionChange("floating-top")}>
                  Floating Top
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onPositionChange("floating-left")}>
                  Floating Left
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onPositionChange("floating-right")}>
                  Floating Right
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onPositionChange(side === "left" ? "sidebar-right" : "sidebar-left")}>
                  Switch to {side === "left" ? "Right" : "Left"} Sidebar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <div className="flex flex-col items-center gap-1">
          <Layers className="h-4 w-4" />
          <span className="text-xs font-medium">Layers</span>
          <span className="text-xs text-muted-foreground">
            ({layerManager.layers.length})
          </span>
        </div>
      </div>

      {/* Layers List */}
      <div className="flex-1 p-2 overflow-y-auto">
        {layerManager.layers.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <div className="text-xl mb-2">📄</div>
            <p className="text-xs">No layers</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {layerManager.layers.map((layer, index) => (
              <SidebarLayerItem
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
  );
};
