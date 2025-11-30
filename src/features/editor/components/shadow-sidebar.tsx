"use client";

import { useEffect, useMemo, useState } from "react";
import { Palette, Sliders, Box } from "lucide-react";

import { ActiveTool, Editor } from "@/features/editor/types";
import { ToolSidebarClose } from "@/features/editor/components/tool-sidebar-close";
import { ToolSidebarHeader } from "@/features/editor/components/tool-sidebar-header";
import { ColorPicker } from "@/features/editor/components/color-picker";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

interface ShadowSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

export const ShadowSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: ShadowSidebarProps) => {
  const shadowData = editor?.getActiveShadow() || null;
  const [shadow, setShadow] = useState({
    enabled: false,
    blur: 10,
    offsetX: 5,
    offsetY: 5,
    color: "#000000",
    type: "drop"
  });

  const onClose = () => {
    onChangeActiveTool("select");
  };

  const updateShadow = (updates: Partial<typeof shadow>) => {
    const newShadow = { ...shadow, ...updates };
    setShadow(newShadow);
    editor?.changeShadow(newShadow);
  };

  const shadowPresets = [
    { name: "None", blur: 0, offsetX: 0, offsetY: 0, color: "rgba(0,0,0,0)" },
    { name: "Soft", blur: 10, offsetX: 2, offsetY: 2, color: "rgba(0,0,0,0.2)" },
    { name: "Medium", blur: 15, offsetX: 5, offsetY: 5, color: "rgba(0,0,0,0.3)" },
    { name: "Hard", blur: 0, offsetX: 3, offsetY: 3, color: "rgba(0,0,0,0.5)" },
    { name: "Drop", blur: 20, offsetX: 0, offsetY: 10, color: "rgba(0,0,0,0.25)" },
  ];

  return (
    <aside
      className={cn(
        "bg-white relative border-r z-[40] w-[360px] h-full flex flex-col",
        activeTool === "shadow" ? "visible" : "hidden",
      )}
    >
      <ToolSidebarHeader
        title="Shadow"
        description="Add depth with shadows and glows"
      />
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6 border-b">
        <div className="flex items-center justify-between">
          <Label className="text-sm">Enable Shadow</Label>
          <Switch
            checked={shadow.enabled}
            onCheckedChange={(enabled) => updateShadow({ enabled })}
          />
        </div>

        {shadow.enabled && (
          <>
            <div className="space-y-2">
              <Label className="text-sm">Shadow Presets</Label>
              <div className="grid grid-cols-2 gap-2">
                {shadowPresets.map((preset) => (
                  <Button
                    key={preset.name}
                    variant="outline"
                    size="sm"
                    onClick={() => updateShadow({
                      blur: preset.blur,
                      offsetX: preset.offsetX,
                      offsetY: preset.offsetY,
                      color: preset.color,
                    })}
                    className="h-12 flex flex-col items-center gap-1"
                  >
                    <div 
                      className="w-4 h-4 bg-blue-500 rounded"
                      style={{
                        boxShadow: `${preset.offsetX}px ${preset.offsetY}px ${preset.blur}px ${preset.color}`
                      }}
                    ></div>
                    <span className="text-xs">{preset.name}</span>
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm">Shadow Color</Label>
                <ColorPicker
                  value={shadow.color}
                  onChange={(color) => updateShadow({ color })}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Blur: {shadow.blur}px</Label>
                <Slider
                  value={[shadow.blur]}
                  onValueChange={(values) => updateShadow({ blur: values[0] })}
                  max={50}
                  min={0}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Offset X: {shadow.offsetX}px</Label>
                <Slider
                  value={[shadow.offsetX]}
                  onValueChange={(values) => updateShadow({ offsetX: values[0] })}
                  max={50}
                  min={-50}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Offset Y: {shadow.offsetY}px</Label>
                <Slider
                  value={[shadow.offsetY]}
                  onValueChange={(values) => updateShadow({ offsetY: values[0] })}
                  max={50}
                  min={-50}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Shadow Types</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateShadow({ 
                    blur: 15, 
                    offsetX: 5, 
                    offsetY: 5, 
                    color: "rgba(0,0,0,0.3)" 
                  })}
                  className="h-12 flex flex-col items-center gap-1"
                >
                  <div className="w-4 h-4 bg-blue-500 rounded shadow-md"></div>
                  <span className="text-xs">Drop Shadow</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateShadow({ 
                    blur: 20, 
                    offsetX: 0, 
                    offsetY: 0, 
                    color: "rgba(59,130,246,0.5)" 
                  })}
                  className="h-12 flex flex-col items-center gap-1"
                >
                  <div className="w-4 h-4 bg-blue-500 rounded shadow-lg shadow-blue-500/50"></div>
                  <span className="text-xs">Glow</span>
                </Button>
              </div>
            </div>
          </>
        )}
        </div>
      </div>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
