"use client";

import { useEffect, useMemo, useState } from "react";
import { Square, Circle, RectangleHorizontal } from "lucide-react";

import { ActiveTool, Editor } from "@/features/editor/types";
import { ToolSidebarClose } from "@/features/editor/components/tool-sidebar-close";
import { ToolSidebarHeader } from "@/features/editor/components/tool-sidebar-header";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

interface BorderRadiusSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

export const BorderRadiusSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: BorderRadiusSidebarProps) => {
  const value = editor?.getActiveBorderRadius() || 0;
  const [borderRadius, setBorderRadius] = useState(0);

  const onClose = () => {
    onChangeActiveTool("select");
  };

  const onChange = (value: number) => {
    setBorderRadius(value);
    editor?.changeBorderRadius(value);
  };

  const presetRadii = [0, 5, 10, 15, 20, 25, 50];

  return (
    <aside
      className={cn(
        "bg-white relative border-r z-[40] w-[360px] h-full flex flex-col",
        activeTool === "border-radius" ? "visible" : "hidden",
      )}
    >
      <ToolSidebarHeader
        title="Border Radius"
        description="Add rounded corners to your shapes"
      />
      <div className="p-4 space-y-6 border-b">
        <div className="space-y-2">
          <Label className="text-sm">Radius: {borderRadius}px</Label>
          <Slider
            value={[borderRadius]}
            onValueChange={(values) => onChange(values[0])}
            max={100}
            min={0}
            step={1}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm">Quick Presets</Label>
          <div className="grid grid-cols-4 gap-2">
            {presetRadii.map((radius) => (
              <Button
                key={radius}
                variant={borderRadius === radius ? "default" : "outline"}
                size="sm"
                onClick={() => onChange(radius)}
                className="h-8"
              >
                {radius}px
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm">Corner Styles</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onChange(borderRadius)}
              className="h-12 flex flex-col items-center gap-1"
            >
              <div className="w-6 h-6 bg-gray-300 rounded"></div>
              <span className="text-xs">Rounded</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onChange(Math.min(borderRadius, 50))}
              className="h-12 flex flex-col items-center gap-1"
            >
              <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
              <span className="text-xs">Circular</span>
            </Button>
          </div>
        </div>
      </div>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
