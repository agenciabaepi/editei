import { useState, useMemo } from "react";
import { Download, Image, FileText, Layers, Settings, Crown } from "lucide-react";
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
  const [quality, setQuality] = useState<number>(100); // Máxima qualidade por padrão
  const [scale, setScale] = useState<number>(2); // 2x por padrão para melhor resolução

  const pageContext = usePageContext();
  const workspace = editor?.getWorkspace();
  const originalWidth = workspace?.width ?? 0;
  const originalHeight = workspace?.height ?? 0;

  // Calcular dimensões de exportação
  const exportWidth = useMemo(() => {
    if (customWidth) return parseInt(customWidth) || originalWidth;
    return Math.round(originalWidth * scale);
  }, [customWidth, originalWidth, scale]);

  const exportHeight = useMemo(() => {
    if (customHeight) return parseInt(customHeight) || originalHeight;
    return Math.round(originalHeight * scale);
  }, [customHeight, originalHeight, scale]);

  // Estimar tamanho do arquivo (aproximado)
  const estimatedFileSize = useMemo(() => {
    const pixels = exportWidth * exportHeight;
    let bytesPerPixel = 4; // RGBA
    
    if (selectedFormat.id === 'jpg') {
      bytesPerPixel = (quality / 100) * 0.5; // JPEG é mais compacto
    } else if (selectedFormat.id === 'webp') {
      bytesPerPixel = (quality / 100) * 0.3;
    } else if (selectedFormat.id === 'png') {
      bytesPerPixel = 4; // PNG sem compressão
    }
    
    const estimatedBytes = pixels * bytesPerPixel;
    
    if (estimatedBytes < 1024) {
      return `${Math.round(estimatedBytes)} B`;
    } else if (estimatedBytes < 1024 * 1024) {
      return `${(estimatedBytes / 1024).toFixed(2)} KB`;
    } else {
      return `${(estimatedBytes / (1024 * 1024)).toFixed(2)} MB`;
    }
  }, [exportWidth, exportHeight, quality, selectedFormat.id]);

  // Determinar tamanho do arquivo (pequeno, médio, grande)
  const fileSizeLabel = useMemo(() => {
    const pixels = exportWidth * exportHeight;
    const size = pixels * (quality / 100);
    
    if (size < 500000) return "pequeno";
    if (size < 2000000) return "médio";
    return "grande";
  }, [exportWidth, exportHeight, quality]);

  const handleExport = async () => {
    if (!editor) return;

    // Check if format requires Pro subscription
    if (selectedFormat.requiresPro && !isPro) {
      triggerPaywall();
      return;
    }

    const exportOptions: ExportOptions = {
      format: selectedFormat,
      quality: (selectedFormat.id === 'jpg' || selectedFormat.id === 'webp') ? quality / 100 : undefined,
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
            quality: 1, // PNG sempre usa qualidade máxima
            multiplier: scale,
            enableRetinaScaling: true, // Habilitar retina scaling
            withoutTransform: false,
          });
          break;
        case 'jpg':
          dataUrl = editor.canvas.toDataURL({
            format: 'jpeg',
            quality: quality / 100,
            multiplier: scale,
            enableRetinaScaling: true, // Habilitar retina scaling
            withoutTransform: false,
          });
          break;
        case 'webp':
          dataUrl = editor.canvas.toDataURL({
            format: 'webp',
            quality: quality / 100,
            multiplier: scale,
            enableRetinaScaling: true, // Habilitar retina scaling
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
        title="Baixar"
        description="Exporte seu design em vários formatos"
      />
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Formato de arquivo */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Formato de arquivo</Label>
            <Select 
              value={selectedFormat.id} 
              onValueChange={(value) => {
                const format = EXPORT_FORMATS.find(f => f.id === value);
                if (format) {
                  if (format.requiresPro && !isPro) {
                    triggerPaywall();
                    return;
                  }
                  handleFormatSelect(format);
                }
              }}
            >
              <SelectTrigger className="w-full">
                <div className="flex items-center gap-2">
                  {selectedFormat.category === 'image' && <Image className="h-4 w-4" />}
                  {selectedFormat.category === 'vector' && <Layers className="h-4 w-4" />}
                  {selectedFormat.category === 'document' && <FileText className="h-4 w-4" />}
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                {EXPORT_FORMATS.map((format) => (
                  <SelectItem 
                    key={format.id} 
                    value={format.id}
                  >
                    <div className="flex items-center gap-2">
                      {format.name}
                      {format.requiresPro && !isPro && (
                        <Crown className="h-3 w-3 text-yellow-500" />
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tamanho */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Tamanho</Label>
              {scale > 2 && !isPro && (
                <Crown className="h-4 w-4 text-gray-400" />
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Slider
                  value={[scale]}
                  onValueChange={(value) => {
                    const newScale = value[0];
                    if (newScale > 2 && !isPro) {
                      triggerPaywall();
                      return;
                    }
                    setScale(newScale);
                  }}
                  max={isPro ? 5 : 2}
                  min={0.25}
                  step={0.125}
                  className="flex-1"
                />
                <div className="flex items-center gap-1 w-20">
                  <Input
                    type="number"
                    value={scale.toFixed(3)}
                    onChange={(e) => {
                      const newScale = parseFloat(e.target.value) || 1;
                      if (newScale > 2 && !isPro) {
                        triggerPaywall();
                        return;
                      }
                      if (newScale >= 0.25 && newScale <= (isPro ? 5 : 2)) {
                        setScale(newScale);
                      }
                    }}
                    className="h-8 w-16 text-sm text-center"
                    step="0.125"
                    min="0.25"
                    max={isPro ? "5" : "2"}
                  />
                  {scale > 2 && !isPro && (
                    <Crown className="h-4 w-4 text-yellow-500" />
                  )}
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                {exportWidth.toLocaleString()} px × {exportHeight.toLocaleString()} px
              </div>
            </div>
          </div>

          {/* Qualidade */}
          {(selectedFormat.id === 'jpg' || selectedFormat.id === 'webp') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Qualidade</Label>
                {quality > 80 && !isPro && (
                  <Crown className="h-4 w-4 text-yellow-500" />
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Slider
                    value={[quality]}
                    onValueChange={(value) => {
                      const newQuality = value[0];
                      if (newQuality > 80 && !isPro) {
                        triggerPaywall();
                        return;
                      }
                      setQuality(newQuality);
                    }}
                    max={isPro ? 100 : 80}
                    min={10}
                    step={5}
                    className="flex-1"
                  />
                  <div className="flex items-center gap-1 w-20">
                    <Input
                      type="number"
                      value={quality}
                      onChange={(e) => {
                        const newQuality = parseInt(e.target.value) || 80;
                        if (newQuality > 80 && !isPro) {
                          triggerPaywall();
                          return;
                        }
                        if (newQuality >= 10 && newQuality <= (isPro ? 100 : 80)) {
                          setQuality(newQuality);
                        }
                      }}
                      className="h-8 w-16 text-sm text-center"
                      step="5"
                      min="10"
                      max={isPro ? "100" : "80"}
                    />
                    {quality > 80 && !isPro && (
                      <Crown className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Baixa (10%)</span>
                  <span>Alta ({isPro ? '100%' : '80%'})</span>
                </div>
              </div>
            </div>
          )}

          {/* Background Settings */}
          {selectedFormat.supportsTransparency && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Incluir Fundo</Label>
                <Switch
                  checked={includeBackground}
                  onCheckedChange={setIncludeBackground}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Desative para exportar com fundo transparente
              </p>
            </div>
          )}

          {/* Tamanho do arquivo */}
          <div className="bg-muted p-3 rounded-lg">
            <div className="text-sm text-muted-foreground">
              Tamanho do arquivo: <span className="font-medium text-foreground">{fileSizeLabel}</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Estimado: ~{estimatedFileSize}
            </div>
          </div>

          {/* Export Button */}
          <Button onClick={handleExport} className="w-full" size="lg">
            <Download className="h-4 w-4 mr-2" />
            Baixar {selectedFormat.name}
          </Button>
        </div>
      </ScrollArea>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
