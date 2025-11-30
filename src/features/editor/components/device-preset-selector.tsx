import { useState, useEffect } from "react";
import { Search, Smartphone, Tablet, Monitor, Share2, Printer, Settings, Trash2 } from "lucide-react";

import { DevicePreset, DEVICE_PRESETS, PRESET_CATEGORIES, getPresetsByCategory, createCustomPreset, getCustomPresets, deleteCustomPreset, getAllPresets } from "@/features/editor/constants/device-presets";
import { Editor } from "@/features/editor/types";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface DevicePresetSelectorProps {
  editor: Editor | undefined;
  currentWidth: number;
  currentHeight: number;
  onPresetSelect: (preset: DevicePreset) => void;
}

const categoryIcons = {
  mobile: Smartphone,
  tablet: Tablet,
  desktop: Monitor,
  social: Share2,
  print: Printer,
  custom: Settings
};

export const DevicePresetSelector = ({
  editor,
  currentWidth,
  currentHeight,
  onPresetSelect
}: DevicePresetSelectorProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [customName, setCustomName] = useState("");
  const [customWidth, setCustomWidth] = useState("");
  const [customHeight, setCustomHeight] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [isCustomDialogOpen, setIsCustomDialogOpen] = useState(false);
  const [customPresets, setCustomPresets] = useState<DevicePreset[]>([]);

  useEffect(() => {
    setCustomPresets(getCustomPresets());
  }, []);

  const filteredPresets = getAllPresets().filter(preset =>
    preset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    preset.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePresetClick = (preset: DevicePreset) => {
    // Add a small delay to ensure workspace is ready
    setTimeout(() => {
      onPresetSelect(preset);
    }, 50);
  };

  const handleCreateCustom = () => {
    if (customName && customWidth && customHeight) {
      const customPreset = createCustomPreset(
        customName,
        parseInt(customWidth),
        parseInt(customHeight),
        customDescription || undefined
      );
      onPresetSelect(customPreset);
      setCustomPresets(getCustomPresets()); // Refresh custom presets
      setCustomName("");
      setCustomWidth("");
      setCustomHeight("");
      setCustomDescription("");
      setIsCustomDialogOpen(false);
    }
  };

  const handleDeleteCustom = (presetId: string) => {
    deleteCustomPreset(presetId);
    setCustomPresets(getCustomPresets()); // Refresh custom presets
  };

  const isCurrentSize = (preset: DevicePreset) => {
    return preset.width === currentWidth && preset.height === currentHeight;
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Device & Canvas Presets</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search presets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs defaultValue="mobile" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="mobile" className="text-xs">
            <Smartphone className="h-3 w-3 mr-1" />
            Mobile
          </TabsTrigger>
          <TabsTrigger value="desktop" className="text-xs">
            <Monitor className="h-3 w-3 mr-1" />
            Desktop
          </TabsTrigger>
          <TabsTrigger value="social" className="text-xs">
            <Share2 className="h-3 w-3 mr-1" />
            Social
          </TabsTrigger>
          <TabsTrigger value="custom" className="text-xs">
            <Settings className="h-3 w-3 mr-1" />
            Custom
          </TabsTrigger>
        </TabsList>

        {['mobile', 'desktop', 'social', 'custom'].map((categoryId) => {
          const category = PRESET_CATEGORIES.find(cat => cat.id === categoryId);
          if (!category) return null;
          const Icon = categoryIcons[category.id];
          const categoryPresets = getPresetsByCategory(category.id).filter(preset =>
            preset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            preset.description?.toLowerCase().includes(searchTerm.toLowerCase())
          );

          return (
            <TabsContent key={category.id} value={category.id} className="mt-4">
              <ScrollArea className="h-48">
                <div className="space-y-2">
                  {categoryPresets.length === 0 && category.id === 'custom' && (
                    <div className="text-center text-muted-foreground text-sm py-8">
                      No custom presets yet. Create one below!
                    </div>
                  )}
                  {categoryPresets.map((preset) => (
                    <div key={preset.id} className="flex items-center gap-2">
                      <Button
                        variant={isCurrentSize(preset) ? "default" : "outline"}
                        className={cn(
                          "flex-1 justify-start text-left h-auto p-3",
                          isCurrentSize(preset) && "bg-primary text-primary-foreground"
                        )}
                        onClick={() => handlePresetClick(preset)}
                      >
                        <div className="flex flex-col items-start w-full">
                          <div className="flex items-center justify-between w-full">
                            <span className="font-medium text-sm">{preset.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {preset.width} × {preset.height}
                            </span>
                          </div>
                          {preset.description && (
                            <span className="text-xs text-muted-foreground mt-1">
                              {preset.description}
                            </span>
                          )}
                        </div>
                      </Button>
                      {category.id === 'custom' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 flex-shrink-0"
                          onClick={() => handleDeleteCustom(preset.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          );
        })}
      </Tabs>

      <div className="space-y-2">
        <Label>More Categories</Label>
        <div className="grid grid-cols-2 gap-2">
          {PRESET_CATEGORIES.slice(3).map((category) => {
            const Icon = categoryIcons[category.id];
            return (
              <Dialog key={category.id}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="h-auto p-3">
                    <div className="flex flex-col items-center">
                      <Icon className="h-4 w-4 mb-1" />
                      <span className="text-xs">{category.name}</span>
                    </div>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center">
                      <Icon className="h-4 w-4 mr-2" />
                      {category.name} Presets
                    </DialogTitle>
                  </DialogHeader>
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {getPresetsByCategory(category.id).map((preset) => (
                        <div key={preset.id} className="flex items-center gap-2">
                          <Button
                            variant={isCurrentSize(preset) ? "default" : "outline"}
                            className="flex-1 justify-start text-left h-auto p-3"
                            onClick={() => handlePresetClick(preset)}
                          >
                            <div className="flex flex-col items-start w-full">
                              <div className="flex items-center justify-between w-full">
                                <span className="font-medium text-sm">{preset.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {preset.width} × {preset.height}
                                </span>
                              </div>
                              {preset.description && (
                                <span className="text-xs text-muted-foreground mt-1">
                                  {preset.description}
                                </span>
                              )}
                            </div>
                          </Button>
                          {category.id === 'custom' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 flex-shrink-0"
                              onClick={() => handleDeleteCustom(preset.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </DialogContent>
              </Dialog>
            );
          })}
        </div>
      </div>

      <Dialog open={isCustomDialogOpen} onOpenChange={setIsCustomDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full">
            <Settings className="h-4 w-4 mr-2" />
            Create Custom Size
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Custom Canvas Size</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                placeholder="Custom preset name"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Width</Label>
                <Input
                  type="number"
                  placeholder="Width"
                  value={customWidth}
                  onChange={(e) => setCustomWidth(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Height</Label>
                <Input
                  type="number"
                  placeholder="Height"
                  value={customHeight}
                  onChange={(e) => setCustomHeight(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description (Optional)</Label>
              <Input
                placeholder="Description"
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
              />
            </div>
            <Button 
              onClick={handleCreateCustom} 
              className="w-full"
              disabled={!customName || !customWidth || !customHeight}
            >
              Create Custom Size
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
