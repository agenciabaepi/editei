"use client";

import { useState } from "react";
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  Copy, 
  ChevronUp, 
  ChevronDown,
  MoreHorizontal,
  Edit2,
  ArrowUp,
  ArrowDown
} from "lucide-react";

import { ActiveTool } from "@/features/editor/types";
import { Editor } from "@/features/editor/types";
import { useLayers } from "@/features/editor/hooks/use-layers";
import { Layer } from "@/features/editor/types/layers";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { ToolSidebarClose } from "@/features/editor/components/tool-sidebar-close";
import { ToolSidebarHeader } from "@/features/editor/components/tool-sidebar-header";
import { cn } from "@/lib/utils";

interface LayersSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

interface LayerItemProps {
  layer: Layer;
  isSelected: boolean;
  onSelect: () => void;
  onToggleVisibility: () => void;
  onToggleLock: () => void;
  onDuplicate: () => void;
  onRename: (name: string) => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
  onOpacityChange: (opacity: number) => void;
}

const LayerItem = ({
  layer,
  isSelected,
  onSelect,
  onToggleVisibility,
  onToggleLock,
  onDuplicate,
  onRename,
  onBringToFront,
  onSendToBack,
  onOpacityChange
}: LayerItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(layer.name);

  const handleNameSubmit = () => {
    onRename(editName);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSubmit();
    } else if (e.key === 'Escape') {
      setEditName(layer.name);
      setIsEditing(false);
    }
  };

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
      className={cn(
        "group flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 cursor-pointer border",
        isSelected && "bg-blue-50 border-blue-200",
        !isSelected && "border-transparent"
      )}
      onClick={onSelect}
    >
      {/* Thumbnail */}
      <div className="w-10 h-10 bg-muted rounded flex items-center justify-center text-xs overflow-hidden">
        {layer.thumbnail ? (
          <img src={layer.thumbnail} alt={layer.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-lg">{getLayerIcon()}</span>
        )}
      </div>

      {/* Layer Info */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <Input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleNameSubmit}
            onKeyDown={handleKeyDown}
            className="h-6 text-xs"
            autoFocus
          />
        ) : (
          <div className="space-y-1">
            <p className="text-sm font-medium truncate">{layer.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{layer.type}</p>
          </div>
        )}
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
            <DropdownMenuItem onClick={() => setIsEditing(true)}>
              <Edit2 className="h-4 w-4 mr-2" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDuplicate}>
              <Copy className="h-4 w-4 mr-2" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onBringToFront}>
              <ArrowUp className="h-4 w-4 mr-2" />
              Bring to Front
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onSendToBack}>
              <ArrowDown className="h-4 w-4 mr-2" />
              Send to Back
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export const LayersSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: LayersSidebarProps) => {
  const layerManager = useLayers({
    canvas: editor?.canvas,
    onLayerChange: (layers) => {
      console.log('Layers updated:', layers);
    }
  });

  const onClose = () => {
    onChangeActiveTool("select");
  };

  const handleOpacityChange = (layerId: string, value: number[]) => {
    layerManager.updateLayerOpacity(layerId, value[0] / 100);
  };

  return (
    <aside className={cn(
      "bg-white relative border-r z-[40] w-[360px] h-full flex flex-col",
      activeTool === "layers" ? "visible" : "hidden"
    )}>
      <ToolSidebarHeader 
        title="Layers" 
        description="Manage your design layers"
      />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Layer List */}
        <div className="space-y-2">
          {layerManager.layers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="text-4xl mb-2">📄</div>
              <p className="text-sm">No layers yet</p>
              <p className="text-xs">Add text, shapes, or images to see layers</p>
            </div>
          ) : (
            layerManager.layers.map((layer) => (
              <LayerItem
                key={layer.id}
                layer={layer}
                isSelected={layerManager.selectedLayerId === layer.id}
                onSelect={() => layerManager.selectLayer(layer.id)}
                onToggleVisibility={() => layerManager.toggleVisibility(layer.id)}
                onToggleLock={() => layerManager.toggleLock(layer.id)}
                onDuplicate={() => layerManager.duplicateLayer(layer.id)}
                onRename={(name) => layerManager.renameLayer(layer.id, name)}
                onBringToFront={() => layerManager.bringToFront(layer.id)}
                onSendToBack={() => layerManager.sendToBack(layer.id)}
                onOpacityChange={(opacity) => layerManager.updateLayerOpacity(layer.id, opacity)}
              />
            ))
          )}
        </div>

        {/* Selected Layer Controls */}
        {layerManager.selectedLayerId && (
          <div className="border-t pt-4 space-y-4">
            <h4 className="font-medium text-sm">Layer Properties</h4>
            
            {(() => {
              const selectedLayer = layerManager.layers.find(l => l.id === layerManager.selectedLayerId);
              if (!selectedLayer) return null;

              return (
                <div className="space-y-3">
                  {/* Opacity Control */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium">Opacity</label>
                      <span className="text-xs text-muted-foreground">
                        {Math.round(selectedLayer.opacity * 100)}%
                      </span>
                    </div>
                    <Slider
                      value={[selectedLayer.opacity * 100]}
                      onValueChange={(value) => handleOpacityChange(selectedLayer.id, value)}
                      max={100}
                      min={0}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  {/* Quick Actions */}
                  <div className="flex justify-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => layerManager.duplicateLayer(selectedLayer.id)}
                      className="text-xs"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Duplicate
                    </Button>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
