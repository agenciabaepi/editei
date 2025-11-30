"use client";

import { useEffect, useMemo, useState } from "react";
import { Palette, Plus, Trash2, RotateCcw, Copy, Shuffle, Sparkles } from "lucide-react";

import { ActiveTool, Editor } from "@/features/editor/types";
import { ToolSidebarClose } from "@/features/editor/components/tool-sidebar-close";
import { ToolSidebarHeader } from "@/features/editor/components/tool-sidebar-header";
import { ColorPicker } from "@/features/editor/components/color-picker";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface GradientStop {
  color: string;
  position: number;
  opacity?: number;
}

interface GradientPreset {
  name: string;
  category: string;
  stops: GradientStop[];
  type?: "linear" | "radial" | "conic";
  angle?: number;
  tags?: string[];
}

interface GradientSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

export const GradientSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: GradientSidebarProps) => {
  const gradientData = editor?.getActiveGradient() || {
    type: "linear",
    angle: 45,
    stops: [
      { color: "#667eea", position: 0, opacity: 1 },
      { color: "#764ba2", position: 100, opacity: 1 },
    ],
  };

  const [gradient, setGradient] = useState({
    type: "linear",
    angle: 45,
    stops: [
      { color: "#667eea", position: 0, opacity: 1 },
      { color: "#764ba2", position: 100, opacity: 1 },
    ],
  });
  const [selectedStop, setSelectedStop] = useState(0);
  const [activeCategory, setActiveCategory] = useState("trending");
  const [searchTerm, setSearchTerm] = useState("");

  const onClose = () => {
    onChangeActiveTool("select");
  };

  const updateGradient = (updates: Partial<typeof gradient>) => {
    const newGradient = { ...gradient, ...updates };
    setGradient(newGradient);
    editor?.changeGradient(newGradient);
  };

  const updateStop = (index: number, updates: Partial<GradientStop>) => {
    const newStops = [...gradient.stops];
    newStops[index] = { ...newStops[index], ...updates };
    // Ensure opacity is set if not provided
    if (newStops[index].opacity === undefined) {
      newStops[index].opacity = 1;
    }
    updateGradient({ stops: newStops });
  };

  const addStop = () => {
    // Find the best position for the new stop
    const sortedStops = [...gradient.stops].sort((a, b) => a.position - b.position);
    let newPosition = 50;
    
    // Find the largest gap between stops
    let maxGap = 0;
    let bestPosition = 50;
    
    for (let i = 0; i < sortedStops.length - 1; i++) {
      const gap = sortedStops[i + 1].position - sortedStops[i].position;
      if (gap > maxGap) {
        maxGap = gap;
        bestPosition = sortedStops[i].position + gap / 2;
      }
    }
    
    if (maxGap > 10) {
      newPosition = bestPosition;
    }
    
    // Interpolate color between adjacent stops
    const leftStop = sortedStops.find(stop => stop.position <= newPosition) || sortedStops[0];
    const rightStop = sortedStops.find(stop => stop.position >= newPosition) || sortedStops[sortedStops.length - 1];
    
    const newColor = leftStop ? leftStop.color : "#ffffff";
    const newStops = [...gradient.stops, { color: newColor, position: newPosition, opacity: 1 }];
    newStops.sort((a, b) => a.position - b.position);
    updateGradient({ stops: newStops });
  };

  const removeStop = (index: number) => {
    if (gradient.stops.length > 2) {
      const newStops = gradient.stops.filter((_: any, i: number) => i !== index);
      updateGradient({ stops: newStops });
      setSelectedStop(Math.min(selectedStop, newStops.length - 1));
    }
  };

  const gradientPresets: GradientPreset[] = [
    // Trending Professional Gradients
    {
      name: "Cosmic Fusion",
      category: "trending",
      stops: [{ color: "#667eea", position: 0 }, { color: "#764ba2", position: 100 }],
      angle: 45,
      tags: ["purple", "blue", "modern"]
    },
    {
      name: "Sunset Blaze",
      category: "trending",
      stops: [{ color: "#f093fb", position: 0 }, { color: "#f5576c", position: 100 }],
      angle: 135,
      tags: ["pink", "red", "warm"]
    },
    {
      name: "Ocean Breeze",
      category: "trending",
      stops: [{ color: "#4facfe", position: 0 }, { color: "#00f2fe", position: 100 }],
      angle: 90,
      tags: ["blue", "cyan", "cool"]
    },
    {
      name: "Golden Hour",
      category: "trending",
      stops: [{ color: "#ffecd2", position: 0 }, { color: "#fcb69f", position: 100 }],
      angle: 180,
      tags: ["orange", "yellow", "warm"]
    },
    {
      name: "Emerald Dream",
      category: "trending",
      stops: [{ color: "#a8edea", position: 0 }, { color: "#fed6e3", position: 100 }],
      angle: 45,
      tags: ["green", "pink", "soft"]
    },
    {
      name: "Midnight City",
      category: "trending",
      stops: [{ color: "#232526", position: 0 }, { color: "#414345", position: 100 }],
      angle: 90,
      tags: ["dark", "gray", "professional"]
    },
    
    // Nature Inspired
    {
      name: "Forest Canopy",
      category: "nature",
      stops: [{ color: "#134e5e", position: 0 }, { color: "#71b280", position: 100 }],
      angle: 45,
      tags: ["green", "forest", "natural"]
    },
    {
      name: "Desert Mirage",
      category: "nature",
      stops: [{ color: "#eacda3", position: 0 }, { color: "#d6ae7b", position: 100 }],
      angle: 135,
      tags: ["brown", "sand", "warm"]
    },
    {
      name: "Aurora Borealis",
      category: "nature",
      stops: [{ color: "#00c6ff", position: 0 }, { color: "#0072ff", position: 50 }, { color: "#00ff88", position: 100 }],
      angle: 90,
      tags: ["blue", "green", "magical"]
    },
    {
      name: "Coral Reef",
      category: "nature",
      stops: [{ color: "#ff9a9e", position: 0 }, { color: "#fecfef", position: 50 }, { color: "#fecfef", position: 100 }],
      angle: 180,
      tags: ["pink", "coral", "soft"]
    },
    
    // Tech & Modern
    {
      name: "Neon Pulse",
      category: "tech",
      stops: [{ color: "#ff006e", position: 0 }, { color: "#8338ec", position: 50 }, { color: "#3a86ff", position: 100 }],
      angle: 45,
      tags: ["neon", "bright", "electric"]
    },
    {
      name: "Digital Matrix",
      category: "tech",
      stops: [{ color: "#0f3460", position: 0 }, { color: "#16537e", position: 100 }],
      angle: 90,
      tags: ["blue", "dark", "tech"]
    },
    {
      name: "Cyber Chrome",
      category: "tech",
      stops: [{ color: "#c3cfe2", position: 0 }, { color: "#c3cfe2", position: 100 }],
      angle: 135,
      tags: ["silver", "metallic", "modern"]
    },
    {
      name: "Holographic",
      category: "tech",
      stops: [{ color: "#ff0099", position: 0 }, { color: "#493240", position: 100 }],
      angle: 180,
      tags: ["pink", "purple", "futuristic"]
    },
    
    // Business & Professional
    {
      name: "Corporate Blue",
      category: "business",
      stops: [{ color: "#1e3c72", position: 0 }, { color: "#2a5298", position: 100 }],
      angle: 45,
      tags: ["blue", "professional", "corporate"]
    },
    {
      name: "Executive Gray",
      category: "business",
      stops: [{ color: "#bdc3c7", position: 0 }, { color: "#2c3e50", position: 100 }],
      angle: 90,
      tags: ["gray", "professional", "elegant"]
    },
    {
      name: "Success Green",
      category: "business",
      stops: [{ color: "#56ab2f", position: 0 }, { color: "#a8e6cf", position: 100 }],
      angle: 135,
      tags: ["green", "success", "growth"]
    },
    {
      name: "Premium Gold",
      category: "business",
      stops: [{ color: "#f7971e", position: 0 }, { color: "#ffd200", position: 100 }],
      angle: 180,
      tags: ["gold", "premium", "luxury"]
    },
    
    // Artistic & Creative
    {
      name: "Watercolor Dream",
      category: "artistic",
      stops: [{ color: "#ffeef8", position: 0 }, { color: "#f0e6ff", position: 50 }, { color: "#e6f3ff", position: 100 }],
      angle: 45,
      tags: ["soft", "pastel", "artistic"]
    },
    {
      name: "Paint Splash",
      category: "artistic",
      stops: [{ color: "#ff6b6b", position: 0 }, { color: "#feca57", position: 50 }, { color: "#48dbfb", position: 100 }],
      angle: 90,
      tags: ["colorful", "vibrant", "creative"]
    },
    {
      name: "Ink Blend",
      category: "artistic",
      stops: [{ color: "#667eea", position: 0 }, { color: "#764ba2", position: 100 }],
      angle: 135,
      tags: ["purple", "blue", "artistic"]
    },
    {
      name: "Canvas Texture",
      category: "artistic",
      stops: [{ color: "#f8f8f8", position: 0 }, { color: "#e8e8e8", position: 100 }],
      angle: 180,
      tags: ["neutral", "texture", "subtle"]
    }
  ];

  const generateGradientCSS = () => {
    const stops = gradient.stops
      .sort((a: any, b: any) => a.position - b.position)
      .map((stop: any) => {
        const opacity = stop.opacity !== undefined ? stop.opacity : 1;
        const color = opacity < 1 ? `${stop.color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}` : stop.color;
        return `${color} ${stop.position}%`;
      })
      .join(", ");
    
    if (gradient.type === "radial") {
      return `radial-gradient(circle, ${stops})`;
    } else if (gradient.type === "conic") {
      return `conic-gradient(from ${gradient.angle}deg, ${stops})`;
    }
    return `linear-gradient(${gradient.angle}deg, ${stops})`;
  };

  const filteredPresets = gradientPresets.filter(preset => {
    const matchesCategory = activeCategory === "all" || preset.category === activeCategory;
    const matchesSearch = searchTerm === "" || 
      preset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      preset.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const categories = [
    { id: "trending", name: "Trending", icon: Sparkles },
    { id: "nature", name: "Nature", icon: Palette },
    { id: "tech", name: "Tech", icon: Palette },
    { id: "business", name: "Business", icon: Palette },
    { id: "artistic", name: "Artistic", icon: Palette },
  ];

  const generateRandomGradient = () => {
    const colors = ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#ffeaa7", "#dda0dd", "#98d8c8", "#f7dc6f", "#bb8fce", "#85c1e9"];
    const randomColors = colors.sort(() => 0.5 - Math.random()).slice(0, 2 + Math.floor(Math.random() * 2));
    const stops = randomColors.map((color, index) => ({
      color,
      position: (index * 100) / (randomColors.length - 1),
      opacity: 1
    }));
    const randomAngle = Math.floor(Math.random() * 360);
    updateGradient({ stops, angle: randomAngle });
  };

  const reverseGradient = () => {
    const reversedStops = gradient.stops.map(stop => ({
      ...stop,
      position: 100 - stop.position
    })).reverse();
    updateGradient({ stops: reversedStops });
  };

  return (
    <aside
      className={cn(
        "bg-white relative border-r z-[40] w-[360px] h-full flex flex-col",
        activeTool === "gradient" ? "visible" : "hidden",
      )}
    >
      <ToolSidebarHeader
        title="Gradient"
        description="Create beautiful gradient fills"
      />
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6 border-b">
        <div className="space-y-2">
          <Label className="text-sm">Gradient Preview</Label>
          <div 
            className="w-full h-12 rounded border"
            style={{ background: generateGradientCSS() }}
          ></div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm">Gradient Type</Label>
          <Select
            value={gradient.type}
            onValueChange={(type) => updateGradient({ type })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="linear">Linear</SelectItem>
              <SelectItem value="radial">Radial</SelectItem>
              <SelectItem value="conic">Conic</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {(gradient.type === "linear" || gradient.type === "conic") && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Angle: {gradient.angle}°</Label>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateGradient({ angle: 0 })}
                  className="h-6 px-2 text-xs"
                >
                  0°
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateGradient({ angle: 45 })}
                  className="h-6 px-2 text-xs"
                >
                  45°
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateGradient({ angle: 90 })}
                  className="h-6 px-2 text-xs"
                >
                  90°
                </Button>
              </div>
            </div>
            <Slider
              value={[gradient.angle]}
              onValueChange={(values) => updateGradient({ angle: values[0] })}
              max={360}
              min={0}
              step={1}
              className="w-full"
            />
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Gradient Presets</Label>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={generateRandomGradient}
                className="h-7 px-2"
                title="Generate Random"
              >
                <Shuffle className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={reverseGradient}
                className="h-7 px-2"
                title="Reverse Gradient"
              >
                <RotateCcw className="w-3 h-3" />
              </Button>
            </div>
          </div>
          
          <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-8">
              <TabsTrigger value="trending" className="text-xs">Trending</TabsTrigger>
              <TabsTrigger value="nature" className="text-xs">Nature</TabsTrigger>
              <TabsTrigger value="tech" className="text-xs">Tech</TabsTrigger>
            </TabsList>
            <div className="mt-2">
              <TabsList className="grid w-full grid-cols-2 h-8">
                <TabsTrigger value="business" className="text-xs">Business</TabsTrigger>
                <TabsTrigger value="artistic" className="text-xs">Artistic</TabsTrigger>
              </TabsList>
            </div>
          </Tabs>
          
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
            {filteredPresets.map((preset) => (
              <Button
                key={preset.name}
                variant="outline"
                size="sm"
                onClick={() => updateGradient({ 
                  stops: preset.stops.map(stop => ({ ...stop, opacity: stop.opacity || 1 })), 
                  angle: preset.angle || gradient.angle,
                  type: preset.type || gradient.type
                })}
                className="h-14 flex flex-col items-center gap-1 p-1 hover:scale-105 transition-transform"
              >
                <div 
                  className="w-full h-8 rounded border"
                  style={{
                    background: `linear-gradient(${preset.angle || 90}deg, ${preset.stops
                      .map(stop => `${stop.color} ${stop.position}%`)
                      .join(", ")})`
                  }}
                ></div>
                <span className="text-xs font-medium truncate w-full text-center">{preset.name}</span>
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Color Stops</Label>
            <Button
              size="sm"
              variant="outline"
              onClick={addStop}
              className="h-8 w-8 p-0"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-3">
            {gradient.stops.map((stop: any, index: number) => (
              <div
                key={index}
                className={cn(
                  "p-3 border rounded-lg space-y-3",
                  selectedStop === index && "border-blue-500 bg-blue-50"
                )}
                onClick={() => setSelectedStop(index)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: stop.color }}
                    ></div>
                    <span className="text-sm">Stop {index + 1}</span>
                  </div>
                  {gradient.stops.length > 2 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeStop(index);
                      }}
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>

                <ColorPicker
                  value={stop.color}
                  onChange={(color) => updateStop(index, { color })}
                />

                <div className="space-y-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Position: {stop.position}%</Label>
                    <Slider
                      value={[stop.position]}
                      onValueChange={(values) => updateStop(index, { position: values[0] })}
                      max={100}
                      min={0}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-xs">Opacity: {Math.round((stop.opacity || 1) * 100)}%</Label>
                    <Slider
                      value={[(stop.opacity || 1) * 100]}
                      onValueChange={(values) => updateStop(index, { opacity: values[0] / 100 })}
                      max={100}
                      min={0}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        </div>
      </div>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
