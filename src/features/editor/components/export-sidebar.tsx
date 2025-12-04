import { useState, useMemo, useEffect } from "react";
import { Download, Image as ImageIcon, FileText, Layers, Settings, Crown, ArrowLeft } from "lucide-react";
import { fabric } from "fabric";
import jsPDF from "jspdf";
import { toast } from "sonner";

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
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ExportSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

const EXPORT_PREFERENCES_KEY = 'canva-export-preferences';

interface ExportPreferences {
  format: string;
  quality: number;
  scale: number;
  limitFileSize: boolean;
  maxFileSizeMB?: number;
}

export const ExportSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: ExportSidebarProps) => {
  const { shouldBlock, triggerPaywall } = usePaywall();
  const isPro = !shouldBlock;

  // Load saved preferences from localStorage
  const loadPreferences = (): ExportPreferences | null => {
    if (typeof window === 'undefined') return null;
    try {
      const saved = localStorage.getItem(EXPORT_PREFERENCES_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Failed to load export preferences:', error);
    }
    return null;
  };

  // Load preferences on mount - Always default to JPG
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>(() => {
    if (typeof window === 'undefined') {
      const jpgFormat = EXPORT_FORMATS.find(f => f.id === 'jpg');
      return jpgFormat || EXPORT_FORMATS[0];
    }
    const savedPrefs = loadPreferences();
    if (savedPrefs?.format) {
      const format = EXPORT_FORMATS.find(f => f.id === savedPrefs.format);
      if (format) return format;
    }
    // Always default to JPG
    const jpgFormat = EXPORT_FORMATS.find(f => f.id === 'jpg');
    return jpgFormat || EXPORT_FORMATS[0];
  });
  
  const [includeBackground, setIncludeBackground] = useState<boolean>(true);
  const [customWidth, setCustomWidth] = useState<string>("");
  const [customHeight, setCustomHeight] = useState<string>("");
  const [maintainAspectRatio, setMaintainAspectRatio] = useState<boolean>(true);
  
  const [quality, setQuality] = useState<number>(() => {
    if (typeof window === 'undefined') return 80;
    const savedPrefs = loadPreferences();
    return savedPrefs?.quality || 80;
  });
  
  const [scale, setScale] = useState<number>(() => {
    if (typeof window === 'undefined') return 1;
    const savedPrefs = loadPreferences();
    return savedPrefs?.scale || 1;
  });
  
  const [limitFileSize, setLimitFileSize] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const savedPrefs = loadPreferences();
    return savedPrefs?.limitFileSize || false;
  });
  
  const [maxFileSizeMB, setMaxFileSizeMB] = useState<number>(() => {
    if (typeof window === 'undefined') return 10;
    const savedPrefs = loadPreferences();
    return savedPrefs?.maxFileSizeMB || 10;
  });
  
  const [savePreferences, setSavePreferences] = useState<boolean>(false);

  // Garantir que o formato seja JPG por padrão se não houver formato selecionado
  useEffect(() => {
    if (!selectedFormat || !selectedFormat.id) {
      const jpgFormat = EXPORT_FORMATS.find(f => f.id === 'jpg');
      if (jpgFormat) {
        setSelectedFormat(jpgFormat);
      }
    }
    // Debug: verificar formato selecionado
    console.log('Formato selecionado:', selectedFormat?.id, 'Mostrar qualidade?', selectedFormat?.id === 'jpg' || selectedFormat?.id === 'webp');
  }, [selectedFormat]);

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

  // Save preferences to localStorage
  useEffect(() => {
    if (savePreferences && typeof window !== 'undefined') {
      const prefs: ExportPreferences = {
        format: selectedFormat.id,
        quality,
        scale,
        limitFileSize,
        maxFileSizeMB,
      };
      try {
        localStorage.setItem(EXPORT_PREFERENCES_KEY, JSON.stringify(prefs));
      } catch (error) {
        console.error('Failed to save export preferences:', error);
      }
    }
  }, [savePreferences, selectedFormat.id, quality, scale, limitFileSize, maxFileSizeMB]);

  // Função para recarregar imagens com crossOrigin antes de exportar
  const reloadImagesWithCrossOrigin = async (canvasInstance: fabric.Canvas) => {
    const images = canvasInstance.getObjects().filter(obj => obj.type === 'image') as fabric.Image[];
    const totalImages = images.length;
    if (totalImages === 0) return;

    let loadedCount = 0;
    return new Promise<void>((resolve) => {
      images.forEach(imgObj => {
        const imgElement = imgObj.getElement() as HTMLImageElement;
        if (!imgElement || !imgElement.src) {
          loadedCount++;
          if (loadedCount === totalImages) resolve();
          return;
        }
        
        const newImg = document.createElement('img');
        newImg.crossOrigin = 'anonymous';
        
        newImg.onload = () => {
          imgObj.setElement(newImg);
          imgObj.setCoords();
          loadedCount++;
          if (loadedCount === totalImages) {
            canvasInstance.renderAll();
            resolve();
          }
        };
        
        newImg.onerror = () => {
          console.warn('Failed to reload image with crossOrigin:', imgElement.src);
          loadedCount++;
          if (loadedCount === totalImages) {
            canvasInstance.renderAll();
            resolve();
          }
        };
        
        newImg.src = imgElement.src;
      });
    });
  };

  // Função para ajustar qualidade para limitar tamanho do arquivo
  const adjustQualityForFileSize = async (
    canvasInstance: fabric.Canvas,
    targetSizeMB: number,
    format: string
  ): Promise<number> => {
    let currentQuality = quality;
    let iterations = 0;
    const maxIterations = 20;
    
    while (iterations < maxIterations) {
      const testDataUrl = canvasInstance.toDataURL({
        format: format === 'jpg' ? 'jpeg' : format as any,
        quality: currentQuality / 100,
        multiplier: scale,
        enableRetinaScaling: true,
        withoutTransform: false,
      });
      
      const sizeInBytes = (testDataUrl.length * 3) / 4; // Base64 to bytes approximation
      const sizeInMB = sizeInBytes / (1024 * 1024);
      
      if (sizeInMB <= targetSizeMB) {
        return currentQuality;
      }
      
      currentQuality = Math.max(10, currentQuality - 5);
      iterations++;
    }
    
    return currentQuality;
  };

  const handleExport = async () => {
    if (!editor) return;

    // Check if format requires Pro subscription
    if (selectedFormat.requiresPro && !isPro) {
      triggerPaywall();
      return;
    }

    try {
      await reloadImagesWithCrossOrigin(editor.canvas);
      
      // Get workspace dimensions for export
      const workspace = editor.getWorkspace();
      if (!workspace) {
        toast.error('Workspace não encontrado');
        return;
      }
      
      const workspaceRect = workspace as fabric.Rect;
      const workspaceWidth = workspaceRect.width || originalWidth;
      const workspaceHeight = workspaceRect.height || originalHeight;
      const workspaceLeft = workspaceRect.left || 0;
      const workspaceTop = workspaceRect.top || 0;
      
      // Calculate export dimensions
      const exportW = customWidth ? parseInt(customWidth) : Math.round(workspaceWidth * scale);
      const exportH = customHeight ? parseInt(customHeight) : Math.round(workspaceHeight * scale);
      
      let finalQuality = quality;
      
      // Ajustar qualidade se limitar tamanho do arquivo estiver ativado
      if (limitFileSize && (selectedFormat.id === 'jpg' || selectedFormat.id === 'webp')) {
        finalQuality = await adjustQualityForFileSize(editor.canvas, maxFileSizeMB, selectedFormat.id);
        if (finalQuality < quality) {
          toast.info(`Qualidade ajustada para ${finalQuality}% para limitar o tamanho do arquivo.`);
        }
      }
      
      // Save current viewport transform
      const originalViewport = editor.canvas.viewportTransform ? [...editor.canvas.viewportTransform] : [1, 0, 0, 1, 0, 0];
      
      // Reset viewport to export workspace area correctly
      editor.canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
      
      let dataUrl: string;
      
      switch (selectedFormat.id) {
        case 'png':
          dataUrl = editor.canvas.toDataURL({
            format: 'png',
            quality: 1, // PNG sempre usa qualidade máxima
            multiplier: scale,
            enableRetinaScaling: true,
            withoutTransform: false,
            width: workspaceWidth,
            height: workspaceHeight,
            left: workspaceLeft,
            top: workspaceTop,
          });
          break;
        case 'jpg':
          dataUrl = editor.canvas.toDataURL({
            format: 'jpeg',
            quality: finalQuality / 100,
            multiplier: scale,
            enableRetinaScaling: true,
            withoutTransform: false,
            width: workspaceWidth,
            height: workspaceHeight,
            left: workspaceLeft,
            top: workspaceTop,
          });
          break;
        case 'webp':
          dataUrl = editor.canvas.toDataURL({
            format: 'webp',
            quality: finalQuality / 100,
            multiplier: scale,
            enableRetinaScaling: true,
            withoutTransform: false,
            width: workspaceWidth,
            height: workspaceHeight,
            left: workspaceLeft,
            top: workspaceTop,
          });
          break;
        case 'svg':
          // Use toDataURL with workspace dimensions for SVG export
          dataUrl = editor.canvas.toDataURL({
            format: 'svg',
            quality: 1,
            multiplier: scale,
            enableRetinaScaling: true,
            withoutTransform: false,
            width: workspaceWidth,
            height: workspaceHeight,
            left: workspaceLeft,
            top: workspaceTop,
          });
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
                    
                    // Get workspace for this page
                    const pageWorkspace = editor.getWorkspace();
                    const pageWorkspaceRect = pageWorkspace as fabric.Rect;
                    const pageWsWidth = pageWorkspaceRect.width || page.width;
                    const pageWsHeight = pageWorkspaceRect.height || page.height;
                    const pageWsLeft = pageWorkspaceRect.left || 0;
                    const pageWsTop = pageWorkspaceRect.top || 0;
                    
                    // Reset viewport for export
                    editor.canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
                    
                    // Get page image data
                    const pageImageData = editor.canvas.toDataURL({
                      format: 'png',
                      quality: 1,
                      multiplier: finalScale,
                      enableRetinaScaling: false,
                      withoutTransform: false,
                      width: pageWsWidth,
                      height: pageWsHeight,
                      left: pageWsLeft,
                      top: pageWsTop,
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
            
            // Get high-quality canvas data with workspace dimensions
            const pdfImageData = editor.canvas.toDataURL({
              format: 'png',
              quality: 1,
              multiplier: scale,
              enableRetinaScaling: false,
              withoutTransform: false,
              width: workspaceWidth,
              height: workspaceHeight,
              left: workspaceLeft,
              top: workspaceTop,
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

      // Restore original viewport transform
      editor.canvas.setViewportTransform(originalViewport);
      
      downloadFile(dataUrl, selectedFormat.extension);
      toast.success('Exportação concluída com sucesso!');
    } catch (error: any) {
      console.error('Export failed:', error);
      // Restore viewport in case of error
      if (editor?.canvas) {
        const originalViewport = editor.canvas.viewportTransform ? [...editor.canvas.viewportTransform] : [1, 0, 0, 1, 0, 0];
        editor.canvas.setViewportTransform(originalViewport);
      }
      if (error.name === 'SecurityError' || error.message?.includes('Tainted canvases')) {
        toast.error('Falha na exportação: Imagens de outras fontes podem ter restrições de segurança (CORS).');
      } else {
        toast.error('Falha na exportação. Tente novamente.');
      }
    }
  };

  const handleFormatSelect = (format: ExportFormat) => {
    setSelectedFormat(format);
    if (format.quality) {
      setQuality(format.quality * 100);
    } else if (format.id === 'jpg' || format.id === 'webp') {
      // Se for JPG ou WebP mas não tiver quality definido, usar 80 como padrão
      setQuality(80);
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
        "bg-white fixed right-0 top-0 border-l z-[50] w-[360px] h-screen flex flex-col shadow-lg transition-transform duration-300",
        activeTool === "export" ? "translate-x-0" : "translate-x-full",
      )}
    >
      <div className="p-4 border-b">
        <div className="flex items-center gap-2 mb-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => onChangeActiveTool("select")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <p className="text-sm font-medium">Baixar</p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6 pb-8">
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
                  {selectedFormat.category === 'image' && <ImageIcon className="h-4 w-4" />}
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
            <Label className="text-sm font-medium">Tamanho ×</Label>
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
                <div className="flex items-center gap-1">
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
                    className="h-8 w-20 text-sm text-center"
                    step="0.125"
                    min="0.25"
                    max={isPro ? "5" : "2"}
                  />
                  {scale > 2 && !isPro && (
                    <Crown className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                {exportWidth.toLocaleString()} px × {exportHeight.toLocaleString()} px
              </div>
            </div>
          </div>

          {/* Qualidade - Mostrar para JPG e WebP */}
          {(selectedFormat?.id === 'jpg' || selectedFormat?.id === 'webp') ? (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Qualidade</Label>
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
                <div className="text-xs text-muted-foreground">
                  Tamanho do arquivo: {fileSizeLabel}
                </div>
              </div>
            </div>
          ) : null}

          {/* Limitar o tamanho do arquivo */}
          {(selectedFormat.id === 'jpg' || selectedFormat.id === 'webp') && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="limit-file-size"
                  checked={limitFileSize}
                  onCheckedChange={(checked: boolean) => {
                    if (checked && !isPro) {
                      triggerPaywall();
                      return;
                    }
                    setLimitFileSize(checked);
                  }}
                />
                <Label htmlFor="limit-file-size" className="text-sm font-medium cursor-pointer flex items-center gap-2">
                  Limitar o tamanho do arquivo
                  {!isPro && (
                    <Crown className="h-4 w-4 text-yellow-500" />
                  )}
                </Label>
              </div>
              {limitFileSize && (
                <div className="pl-6 space-y-2">
                  <Input
                    type="number"
                    value={maxFileSizeMB}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 1;
                      if (value >= 0.1 && value <= 100) {
                        setMaxFileSizeMB(value);
                      }
                    }}
                    className="h-8 w-24 text-sm"
                    step="0.1"
                    min="0.1"
                    max="100"
                  />
                  <p className="text-xs text-muted-foreground">Tamanho máximo em MB</p>
                </div>
              )}
            </div>
          )}

          {/* Preferências */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Preferências</Label>
            <div className="flex items-center gap-2">
              <Checkbox
                id="save-preferences"
                checked={savePreferences}
                onCheckedChange={(checked: boolean) => setSavePreferences(checked)}
              />
              <Label htmlFor="save-preferences" className="text-sm cursor-pointer">
                Salvar configurações de download
              </Label>
            </div>
          </div>

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

          {/* Export Button */}
          <Button onClick={handleExport} className="w-full" size="lg">
            <Download className="h-4 w-4 mr-2" />
            Baixar {selectedFormat.name}
          </Button>
        </div>
      </div>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
