"use client";

import { useEffect, useMemo, useState } from "react";
import { Brush, Pen, Eraser, Palette, Circle, Square, Triangle } from "lucide-react";

import { ActiveTool, Editor } from "@/features/editor/types";
import { ToolSidebarClose } from "@/features/editor/components/tool-sidebar-close";
import { ToolSidebarHeader } from "@/features/editor/components/tool-sidebar-header";
import { ColorPicker } from "@/features/editor/components/color-picker";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface EnhancedDrawSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

export const EnhancedDrawSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: EnhancedDrawSidebarProps) => {
  const drawData = editor?.getActiveDrawSettings() || {
    brushType: "pen",
    color: "#000000",
    size: 5,
    opacity: 1,
    smoothing: 0.5,
    pressure: false,
  };

  const [drawSettings, setDrawSettings] = useState({
    brushType: "pen",
    color: "#000000",
    size: 5,
    opacity: 1,
    smoothing: 0.5,
    pressure: false,
  });

  const onClose = () => {
    onChangeActiveTool("select");
  };

  const updateDrawSettings = (updates: Partial<typeof drawSettings>) => {
    const newSettings = { ...drawSettings, ...updates };
    setDrawSettings(newSettings);
    editor?.changeDrawSettings(newSettings);
  };

  const brushTypes = [
    { 
      name: "Pen", 
      value: "pen", 
      icon: Pen, 
      description: "Sharp, precise lines" 
    },
    { 
      name: "Brush", 
      value: "brush", 
      icon: Brush, 
      description: "Soft, painterly strokes" 
    },
    { 
      name: "Marker", 
      value: "marker", 
      icon: Circle, 
      description: "Bold, flat strokes" 
    },
    { 
      name: "Pencil", 
      value: "pencil", 
      icon: Triangle, 
      description: "Textured, sketchy lines" 
    },
    { 
      name: "Eraser", 
      value: "eraser", 
      icon: Eraser, 
      description: "Remove drawn content" 
    },
  ];

  const colorPresets = [
    "#000000", "#ffffff", "#ef4444", "#f97316",
    "#f59e0b", "#eab308", "#22c55e", "#10b981",
    "#06b6d4", "#0ea5e9", "#3b82f6", "#6366f1",
    "#8b5cf6", "#a855f7", "#ec4899", "#f43f5e",
  ];

  const brushSizes = [1, 2, 5, 10, 15, 20, 30, 50];

  return (
    <aside
      className={cn(
        "bg-white relative border-r z-[40] w-[360px] h-full flex flex-col",
        activeTool === "draw" ? "visible" : "hidden",
      )}
    >
      <ToolSidebarHeader
        title="Enhanced Drawing"
        description="Professional drawing tools and settings"
      />
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6 border-b">
          <Tabs defaultValue="brush" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="brush">Brush</TabsTrigger>
              <TabsTrigger value="color">Color</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

          <TabsContent value="brush" className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">Brush Type</Label>
              <div className="grid grid-cols-1 gap-2">
                {brushTypes.map((brush) => {
                  const Icon = brush.icon;
                  return (
                    <Button
                      key={brush.value}
                      variant={drawSettings.brushType === brush.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateDrawSettings({ brushType: brush.value })}
                      className="h-12 justify-start gap-3"
                    >
                      <Icon className="w-4 h-4" />
                      <div className="text-left">
                        <div className="font-medium">{brush.name}</div>
                        <div className="text-xs text-gray-500">{brush.description}</div>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Brush Size: {drawSettings.size}px</Label>
              <Slider
                value={[drawSettings.size]}
                onValueChange={(values) => updateDrawSettings({ size: values[0] })}
                max={100}
                min={1}
                step={1}
                className="w-full"
              />
              
              <div className="grid grid-cols-4 gap-2 mt-2">
                {brushSizes.map((size) => (
                  <Button
                    key={size}
                    variant={drawSettings.size === size ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateDrawSettings({ size })}
                    className="h-8 flex items-center justify-center"
                  >
                    <div
                      className="bg-current rounded-full"
                      style={{
                        width: Math.min(size / 2, 12),
                        height: Math.min(size / 2, 12),
                      }}
                    />
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Brush Preview</Label>
              <div className="h-16 border rounded bg-gray-50 flex items-center justify-center">
                <div
                  className="rounded-full"
                  style={{
                    width: Math.min(drawSettings.size, 40),
                    height: Math.min(drawSettings.size, 40),
                    backgroundColor: drawSettings.color,
                    opacity: drawSettings.opacity,
                  }}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="color" className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">Brush Color</Label>
              <ColorPicker
                value={drawSettings.color}
                onChange={(color) => updateDrawSettings({ color })}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Color Presets</Label>
              <div className="grid grid-cols-4 gap-2">
                {colorPresets.map((color) => (
                  <button
                    key={color}
                    className={cn(
                      "w-12 h-12 rounded border-2 transition-all",
                      drawSettings.color === color 
                        ? "border-blue-500 scale-110" 
                        : "border-gray-200 hover:border-gray-300"
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => updateDrawSettings({ color })}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Opacity: {Math.round(drawSettings.opacity * 100)}%</Label>
              <Slider
                value={[drawSettings.opacity]}
                onValueChange={(values) => updateDrawSettings({ opacity: values[0] })}
                max={1}
                min={0.1}
                step={0.1}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Quick Colors</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateDrawSettings({ color: "#000000" })}
                  className="h-8"
                >
                  Black
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateDrawSettings({ color: "#ffffff" })}
                  className="h-8"
                >
                  White
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateDrawSettings({ color: "#ef4444" })}
                  className="h-8"
                >
                  Red
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">Smoothing: {Math.round(drawSettings.smoothing * 100)}%</Label>
              <Slider
                value={[drawSettings.smoothing]}
                onValueChange={(values) => updateDrawSettings({ smoothing: values[0] })}
                max={1}
                min={0}
                step={0.1}
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                Higher values create smoother, more fluid lines
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Drawing Modes</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateDrawSettings({ brushType: "pen" })}
                  className="h-12 flex flex-col items-center gap-1"
                >
                  <Pen className="w-4 h-4" />
                  <span className="text-xs">Draw</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateDrawSettings({ brushType: "eraser" })}
                  className="h-12 flex flex-col items-center gap-1"
                >
                  <Eraser className="w-4 h-4" />
                  <span className="text-xs">Erase</span>
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Advanced Options</Label>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Pressure Sensitivity</span>
                  <Button
                    variant={drawSettings.pressure ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateDrawSettings({ pressure: !drawSettings.pressure })}
                  >
                    {drawSettings.pressure ? "On" : "Off"}
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Drawing Actions</Label>
              <div className="grid grid-cols-1 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => editor?.clearDrawing?.()}
                  className="h-8"
                >
                  Clear All Drawing
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => editor?.undoDrawing?.()}
                  className="h-8"
                >
                  Undo Last Stroke
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        </div>
      </div>
      
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
