import { useState } from "react";
import { Download, Image, FileText, Layers, Settings } from "lucide-react";
import jsPDF from "jspdf";

import { ExportFormat, ExportOptions, EXPORT_FORMATS, getFormatsByCategory } from "@/features/editor/constants/export-formats";
import { usePaywall } from "@/features/subscriptions/hooks/use-paywall";
import { ActiveTool, Editor, JSON_KEYS } from "@/features/editor/types";
import { ToolSidebarClose } from "@/features/editor/components/tool-sidebar-close";
import { ToolSidebarHeader } from "@/features/editor/components/tool-sidebar-header";
import { downloadFile } from "@/features/editor/utils";
import { usePageContext } from "@/features/editor/contexts/page-context";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ExportSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

export const ExportSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: ExportSidebarProps) => {
  const { shouldBlock, triggerPaywall } = usePaywall();
  const isPro = !shouldBlock;

  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>(EXPORT_FORMATS[0]);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: EXPORT_FORMATS[0],
    quality: 0.9,
    scale: 1,
  });
  const [includeBackground, setIncludeBackground] = useState<boolean>(true);
  const [customWidth, setCustomWidth] = useState<string>("");
  const [customHeight, setCustomHeight] = useState<string>("");
  const [maintainAspectRatio, setMaintainAspectRatio] = useState<boolean>(true);
  const [quality, setQuality] = useState<number>(90);
  const [scale, setScale] = useState<number>(1);

  const pageContext = usePageContext();
  const workspace = editor?.getWorkspace();
  const originalWidth = workspace?.width ?? 0;
  const originalHeight = workspace?.height ?? 0;

  const handleExport = async () => {
    if (!editor) return;

    // Check if format requires Pro subscription
    if (selectedFormat.requiresPro && !isPro) {
      triggerPaywall();
      return;
    }

    const exportOptions: ExportOptions = {
      format: selectedFormat,
      quality: selectedFormat.quality ? quality / 100 : undefined,
      scale,
      width: customWidth ? parseInt(customWidth) : undefined,
      height: customHeight ? parseInt(customHeight) : undefined,
      includeBackground
    };

    try {
      let dataUrl: string;
      
      switch (selectedFormat.id) {
        case 'png':
          dataUrl = editor.canvas.toDataURL({
            format: 'png',
            quality: 1,
            multiplier: scale,
            enableRetinaScaling: false,
            withoutTransform: false,
          });
          break;
        case 'jpg':
          dataUrl = editor.canvas.toDataURL({
            format: 'jpeg',
            quality: quality / 100,
            multiplier: scale,
            enableRetinaScaling: false,
            withoutTransform: false,
          });
          break;
        case 'webp':
          dataUrl = editor.canvas.toDataURL({
            format: 'webp',
            quality: quality / 100,
            multiplier: scale,
            enableRetinaScaling: false,
            withoutTransform: false,
          });
          break;
        case 'svg':
          const svgData = editor.canvas.toSVG();
          const svgBlob = new Blob([svgData], { type: 'image/svg+xml' });
          dataUrl = URL.createObjectURL(svgBlob);
          break;
        case 'pdf':
          // Generate PDF using jsPDF
          if (pageContext && pageContext.pages.length > 1) {
            // Multi-page PDF export
            pageContext.saveCurrentPage(); // Save current page first
            
            // Save original canvas state before processing pages
            const originalCanvasData = JSON.stringify(editor.canvas.toJSON());
            
            const pdf = new jsPDF({
              orientation: originalWidth > originalHeight ? 'landscape' : 'portrait',
              unit: 'mm',
              format: 'a4' // Use standard A4 format for multi-page
            });
            
            let isFirstPage = true;
            
            for (const page of pageContext.pages) {
              if (!isFirstPage) {
                pdf.addPage();
              }
              
              if (page.canvasData) {
                await new Promise<void>((resolve) => {
                  editor.loadJson(page.canvasData);
                  setTimeout(() => {
                    // Get page dimensions
                    const pageWidth = (page.width * 25.4) / 96; // Convert to mm
                    const pageHeight = (page.height * 25.4) / 96;
                    
                    // Calculate scaling to fit A4
                    const a4Width = 210; // A4 width in mm
                    const a4Height = 297; // A4 height in mm
                    const scaleX = a4Width / pageWidth;
                    const scaleY = a4Height / pageHeight;
                    const finalScale = Math.min(scaleX, scaleY, 1) * scale;
                    
                    const finalWidth = pageWidth * finalScale;
                    const finalHeight = pageHeight * finalScale;
                    
                    // Center the page on A4
                    const offsetX = (a4Width - finalWidth) / 2;
                    const offsetY = (a4Height - finalHeight) / 2;
                    
                    // Get page image data
                    const pageImageData = editor.canvas.toDataURL({
                      format: 'png',
                      quality: 1,
                      multiplier: finalScale,
                      enableRetinaScaling: false,
                      withoutTransform: false,
                    });
                    
                    // Add image to PDF
                    pdf.addImage(pageImageData, 'PNG', offsetX, offsetY, finalWidth, finalHeight);
                    
                    resolve();
                  }, 100);
                });
              }
              
              isFirstPage = false;
            }
            
            // Restore original canvas state
            editor.loadJson(originalCanvasData);
            
            // Generate blob and create download URL
            const pdfBlob = pdf.output('blob');
            dataUrl = URL.createObjectURL(pdfBlob);
          } else {
            // Single page PDF export
            const pageWidth = (originalWidth * 25.4) / 96; // Convert to mm
            const pageHeight = (originalHeight * 25.4) / 96;
            
            // Create PDF with exact canvas dimensions
            const pdf = new jsPDF({
              orientation: pageWidth > pageHeight ? 'landscape' : 'portrait',
              unit: 'mm',
              format: [pageWidth, pageHeight]
            });
            
            // Get high-quality canvas data
            const pdfImageData = editor.canvas.toDataURL({
              format: 'png',
              quality: 1,
              multiplier: scale,
              enableRetinaScaling: false,
              withoutTransform: false,
            });
            
            // Add image to PDF
            pdf.addImage(pdfImageData, 'PNG', 0, 0, pageWidth, pageHeight);
            
            // Generate blob and create download URL
            const pdfBlob = pdf.output('blob');
            dataUrl = URL.createObjectURL(pdfBlob);
          }
          break;
        case 'json':
          // Export JSON template
          const canvasData = editor.canvas.toJSON(JSON_KEYS);
          const jsonString = JSON.stringify(canvasData, null, 2);
          const jsonBlob = new Blob([jsonString], { type: 'application/json' });
          dataUrl = URL.createObjectURL(jsonBlob);
          break;
        default:
          dataUrl = editor.canvas.toDataURL();
      }

      downloadFile(dataUrl, selectedFormat.extension);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleFormatSelect = (format: ExportFormat) => {
    setSelectedFormat(format);
    if (format.quality) {
      setQuality(format.quality * 100);
    }
  };

  const handleCustomWidthChange = (value: string) => {
    setCustomWidth(value);
    if (maintainAspectRatio && value && originalWidth && originalHeight) {
      const ratio = originalHeight / originalWidth;
      setCustomHeight(Math.round(parseInt(value) * ratio).toString());
    }
  };

  const handleCustomHeightChange = (value: string) => {
    setCustomHeight(value);
    if (maintainAspectRatio && value && originalWidth && originalHeight) {
      const ratio = originalWidth / originalHeight;
      setCustomWidth(Math.round(parseInt(value) * ratio).toString());
    }
  };

  const onClose = () => {
    onChangeActiveTool("select");
  };

  const categoryIcons = {
    image: Image,
    vector: Layers,
    document: FileText
  };

  return (
    <aside
      className={cn(
        "bg-white relative border-r z-[40] w-[360px] h-full flex flex-col",
        activeTool === "export" ? "visible" : "hidden",
      )}
    >
      <ToolSidebarHeader
        title="Export Design"
        description="Download your design in various formats"
      />
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Format Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Export Format</Label>
            <Tabs defaultValue="image" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="image" className="text-xs">
                  <Image className="h-3 w-3 mr-1" />
                  Image
                </TabsTrigger>
                <TabsTrigger value="vector" className="text-xs">
                  <Layers className="h-3 w-3 mr-1" />
                  Vector
                </TabsTrigger>
                <TabsTrigger value="document" className="text-xs">
                  <FileText className="h-3 w-3 mr-1" />
                  Document
                </TabsTrigger>
              </TabsList>

              {(['image', 'vector', 'document'] as const).map((category) => (
                <TabsContent key={category} value={category} className="mt-3">
                  <div className="space-y-2">
                    {getFormatsByCategory(category).map((format) => (
                      <Button
                        key={format.id}
                        variant={selectedFormat.id === format.id ? "default" : "outline"}
                        className="w-full justify-start h-auto p-3"
                        onClick={() => {
                          if (format.requiresPro && !isPro) {
                            triggerPaywall();
                            return;
                          }
                          setSelectedFormat(format);
                          setExportOptions(prev => ({ ...prev, format }));
                        }}
                      >
                        <div className="text-left">
                          <div className="font-medium flex items-center gap-2">
                            {format.name}
                            {format.requiresPro && !isPro && (
                              <span className="text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded">
                                Pro
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format.description}
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>

          {/* Quality Settings */}
          {selectedFormat.quality && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Quality</Label>
              <div className="space-y-2">
                <Slider
                  value={[quality]}
                  onValueChange={(value) => setQuality(value[0])}
                  max={100}
                  min={10}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Low (10%)</span>
                  <span>{quality}%</span>
                  <span>High (100%)</span>
                </div>
              </div>
            </div>
          )}

          {/* Scale Settings */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Scale</Label>
            <Select value={scale.toString()} onValueChange={(value) => setScale(parseFloat(value))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0.5">0.5x (50%)</SelectItem>
                <SelectItem value="1">1x (100%)</SelectItem>
                <SelectItem value="1.5">1.5x (150%)</SelectItem>
                <SelectItem value="2">2x (200%)</SelectItem>
                <SelectItem value="3">3x (300%)</SelectItem>
                <SelectItem value="4">4x (400%)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Custom Dimensions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Custom Size</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={maintainAspectRatio}
                  onCheckedChange={setMaintainAspectRatio}
                />
                <Label className="text-xs">Lock aspect ratio</Label>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Width</Label>
                <Input
                  type="number"
                  placeholder={originalWidth.toString()}
                  value={customWidth}
                  onChange={(e) => handleCustomWidthChange(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Height</Label>
                <Input
                  type="number"
                  placeholder={originalHeight.toString()}
                  value={customHeight}
                  onChange={(e) => handleCustomHeightChange(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Background Settings */}
          {selectedFormat.supportsTransparency && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Include Background</Label>
                <Switch
                  checked={includeBackground}
                  onCheckedChange={setIncludeBackground}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Turn off to export with transparent background
              </p>
            </div>
          )}

          {/* Export Info */}
          <div className="bg-muted p-3 rounded-lg space-y-2">
            <h4 className="text-sm font-medium">Export Details</h4>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>Format: {selectedFormat.name} (.{selectedFormat.extension})</div>
              <div>Original: {originalWidth} × {originalHeight}px</div>
              <div>
                Export: {customWidth || Math.round(originalWidth * scale)} × {customHeight || Math.round(originalHeight * scale)}px
              </div>
              {selectedFormat.quality && <div>Quality: {quality}%</div>}
              <div>Scale: {scale}x</div>
            </div>
          </div>

          {/* Export Button */}
          <Button onClick={handleExport} className="w-full" size="lg">
            <Download className="h-4 w-4 mr-2" />
            Export {selectedFormat.name}
          </Button>
        </div>
      </ScrollArea>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
