"use client";

import { useEffect, useMemo, useState } from "react";
import { Trash2 } from "lucide-react";

import { ActiveTool, Editor } from "@/features/editor/types";
import { ToolSidebarClose } from "@/features/editor/components/tool-sidebar-close";
import { ToolSidebarHeader } from "@/features/editor/components/tool-sidebar-header";
import { ColorPicker } from "@/features/editor/components/color-picker";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";

interface BackgroundSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

export const BackgroundSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: BackgroundSidebarProps) => {
  const backgroundData = editor?.getActiveBackground() || {
    type: "transparent",
    color: "#ffffff",
    pattern: "none",
    opacity: 1,
  };

  const [background, setBackground] = useState(backgroundData);

  // Sync background state when editor changes
  useEffect(() => {
    if (editor) {
      const currentBackground = editor.getActiveBackground();
      setBackground(currentBackground);
    }
  }, [editor]);

  const onClose = () => {
    onChangeActiveTool("select");
  };

  const updateBackground = (updates: Partial<typeof background>) => {
    const newBackground = { ...background, ...updates };
    console.log("Background sidebar - updating background:", newBackground);
    setBackground(newBackground);
    if (editor) {
      console.log("Background sidebar - calling editor.changeBackground");
      editor.changeBackground(newBackground);
    } else {
      console.log("Background sidebar - no editor available");
    }
  };


  const colorPresets = [
    "#ffffff", "#f8fafc", "#f1f5f9", "#e2e8f0",
    "#000000", "#1e293b", "#334155", "#475569",
    "#ef4444", "#f97316", "#f59e0b", "#eab308",
    "#22c55e", "#10b981", "#06b6d4", "#0ea5e9",
    "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7",
    "#ec4899", "#f43f5e", "#be123c", "#881337",
  ];

  const patterns = [
    { name: "None", value: "none", preview: "bg-white" },
    { name: "Dots", value: "dots", preview: "bg-white" },
    { name: "Grid", value: "grid", preview: "bg-white" },
    { name: "Lines", value: "lines", preview: "bg-white" },
    { name: "Diagonal", value: "diagonal", preview: "bg-white" },
    { name: "Checkerboard", value: "checkerboard", preview: "bg-white" },
  ];

  console.log("Background sidebar render - activeTool:", activeTool, "isVisible:", activeTool === "background");
  
  return (
    <aside
      className={cn(
        "bg-white relative border-r z-[40] w-[360px] h-full flex flex-col",
        activeTool === "background" ? "visible" : "hidden",
      )}
    >
      <ToolSidebarHeader
        title="Background"
        description="Customize canvas background"
      />
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6 border-b flex-1 overflow-y-auto">
          <Tabs defaultValue="color" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="color">Color</TabsTrigger>
              <TabsTrigger value="pattern">Pattern</TabsTrigger>
            </TabsList>

          <TabsContent value="color" className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Transparent Background</Label>
                <Switch
                  checked={background.type === "transparent"}
                  onCheckedChange={(checked) => 
                    updateBackground({ type: checked ? "transparent" : "color" })
                  }
                />
              </div>
              {background.type === "transparent" && (
                <p className="text-xs text-gray-500">
                  Background will be transparent when exported
                </p>
              )}
            </div>

            {background.type !== "transparent" && (
              <>
                <div className="space-y-2">
                  <Label className="text-sm">Background Color</Label>
                  <ColorPicker
                    value={background.color}
                    onChange={(color) => updateBackground({ color, type: "color" })}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Color Presets</Label>
                  <div className="grid grid-cols-6 gap-2">
                    {colorPresets.map((color) => (
                      <button
                        key={color}
                        className={cn(
                          "w-8 h-8 rounded border-2 transition-all",
                          background.color === color 
                            ? "border-blue-500 scale-110" 
                            : "border-gray-200 hover:border-gray-300"
                        )}
                        style={{ backgroundColor: color }}
                        onClick={() => updateBackground({ color, type: "color" })}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Quick Actions</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateBackground({ color: "#ffffff", type: "color" })}
                      className="h-10"
                    >
                      White
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateBackground({ type: "transparent" })}
                      className="h-10"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="pattern" className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">Pattern Type</Label>
              <div className="grid grid-cols-2 gap-2">
                {patterns.map((pattern) => (
                  <Button
                    key={pattern.value}
                    variant={background.pattern === pattern.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateBackground({ 
                      pattern: pattern.value, 
                      type: "pattern" 
                    })}
                    className="h-12 flex flex-col items-center gap-1"
                  >
                    <div className={cn("w-6 h-6 border rounded", pattern.preview)}>
                      {pattern.value === "dots" && (
                        <div className="w-full h-full bg-gradient-to-r from-gray-300 via-transparent to-gray-300 opacity-50"></div>
                      )}
                      {pattern.value === "grid" && (
                        <div className="w-full h-full border-r border-b border-gray-300"></div>
                      )}
                      {pattern.value === "lines" && (
                        <div className="w-full h-full bg-gradient-to-b from-gray-300 via-transparent to-gray-300 opacity-50"></div>
                      )}
                    </div>
                    <span className="text-xs">{pattern.name}</span>
                  </Button>
                ))}
              </div>
            </div>

            {background.pattern !== "none" && (
              <div className="space-y-2">
                <Label className="text-sm">Pattern Color</Label>
                <ColorPicker
                  value={background.color}
                  onChange={(color) => updateBackground({ color })}
                />
              </div>
            )}
          </TabsContent>

        </Tabs>
        </div>
      </div>
      
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
