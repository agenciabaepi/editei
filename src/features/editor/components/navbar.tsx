"use client";

import { CiFileOn } from "react-icons/ci";
import { BsCloudCheck, BsCloudSlash } from "react-icons/bs";
import { useFilePicker } from "use-file-picker";
import { useMutationState } from "@tanstack/react-query";
import { 
  ChevronDown, 
  Download, 
  Loader, 
  MousePointerClick, 
  Redo2, 
  Undo2,
  Users,
  Image,
  FileText,
  Layers,
  ArrowLeft
} from "lucide-react";

import { EXPORT_FORMATS, getFormatsByCategory } from "@/features/editor/constants/export-formats";
import { usePaywall } from "@/features/subscriptions/hooks/use-paywall";
import { usePageContext } from "@/features/editor/contexts/page-context";
import jsPDF from "jspdf";

import { UserButton } from "@/features/auth/components/user-button";
import { downloadFile } from "@/features/editor/utils";

import { ActiveTool, Editor } from "@/features/editor/types";
import { Logo } from "@/features/editor/components/logo";

import { cn } from "@/lib/utils";
import { Hint } from "@/components/hint";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProjectNameDialog } from "@/components/project-name-dialog";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { fabric } from "fabric";

interface NavbarProps {
  id: string;
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
  onShare?: () => void;
  projectName?: string;
};

export const Navbar = ({
  id,
  editor,
  activeTool,
  onChangeActiveTool,
  onShare,
  projectName,
}: NavbarProps) => {
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const { shouldBlock, triggerPaywall } = usePaywall();
  const isPro = !shouldBlock;
  const router = useRouter();
  
  const data = useMutationState({
    filters: {
      mutationKey: ["project", { id }],
      exact: true,
    },
    select: (mutation) => mutation.state.status,
  });

  const currentStatus = data[data.length - 1];
  const pageContext = usePageContext();

  const isError = currentStatus === "error";
  const isPending = currentStatus === "pending";

  const { openFilePicker } = useFilePicker({
    accept: ".json",
    onFilesSuccessfullySelected: ({ plainFiles }: any) => {
      if (plainFiles && plainFiles.length > 0) {
        const file = plainFiles[0];
        const reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onload = () => {
          editor?.loadJson(reader.result as string);
        };
      }
    },
  });

  // Função para recarregar imagens com crossOrigin antes de exportar
  const reloadImagesWithCrossOrigin = async (canvas: fabric.Canvas): Promise<void> => {
    const imageObjects = canvas.getObjects().filter(obj => obj.type === 'image') as fabric.Image[];
    
    if (imageObjects.length === 0) return;
    
    return new Promise((resolve) => {
      let loadedCount = 0;
      const totalImages = imageObjects.length;
      
      if (totalImages === 0) {
        resolve();
        return;
      }
      
      imageObjects.forEach((imgObj) => {
        const imgElement = imgObj.getElement() as HTMLImageElement;
        if (!imgElement || !imgElement.src) {
          loadedCount++;
          if (loadedCount === totalImages) resolve();
          return;
        }
        
        // Criar nova imagem com crossOrigin
        const newImg = document.createElement('img');
        newImg.crossOrigin = 'anonymous';
        
        newImg.onload = () => {
          // Substituir a imagem no objeto
          imgObj.setElement(newImg);
          imgObj.setCoords();
          loadedCount++;
          if (loadedCount === totalImages) {
            canvas.renderAll();
            resolve();
          }
        };
        
        newImg.onerror = () => {
          // Se falhar, continuar mesmo assim
          console.warn('Failed to reload image with crossOrigin:', imgElement.src);
          loadedCount++;
          if (loadedCount === totalImages) {
            canvas.renderAll();
            resolve();
          }
        };
        
        newImg.src = imgElement.src;
      });
    });
  };

  const handleExport = async (formatId: string) => {
    if (!editor) return;

    const format = EXPORT_FORMATS.find(f => f.id === formatId);
    if (!format) return;

    // Check if format requires Pro subscription
    if (format.requiresPro && !isPro) {
      triggerPaywall();
      return;
    }

    const workspace = editor.getWorkspace();
    const originalWidth = workspace?.width ?? 0;
    const originalHeight = workspace?.height ?? 0;

    try {
      // Recarregar imagens com crossOrigin antes de exportar
      await reloadImagesWithCrossOrigin(editor.canvas);
      
      let dataUrl: string;
      
      switch (formatId) {
        case 'png':
          dataUrl = editor.canvas.toDataURL({
            format: 'png',
            quality: 1, // Máxima qualidade para PNG
            multiplier: 2, // 2x para melhor resolução (retina)
            enableRetinaScaling: true,
            withoutTransform: false,
          });
          break;
        case 'jpg':
          dataUrl = editor.canvas.toDataURL({
            format: 'jpeg',
            quality: 1, // Máxima qualidade (100%)
            multiplier: 2, // 2x para melhor resolução (retina)
            enableRetinaScaling: true,
            withoutTransform: false,
          });
          break;
        case 'webp':
          dataUrl = editor.canvas.toDataURL({
            format: 'webp',
            quality: 1, // Máxima qualidade (100%)
            multiplier: 2, // 2x para melhor resolução (retina)
            enableRetinaScaling: true,
            withoutTransform: false,
          });
          break;
        case 'svg':
          const svgData = editor.canvas.toSVG();
          const svgBlob = new Blob([svgData], { type: 'image/svg+xml' });
          dataUrl = URL.createObjectURL(svgBlob);
          break;
        case 'pdf':
          if (pageContext && pageContext.pages.length > 1) {
            // Multi-page PDF export
            pageContext.saveCurrentPage();
            const originalCanvasData = JSON.stringify(editor.canvas.toJSON());
            
            const pdf = new jsPDF({
              orientation: originalWidth > originalHeight ? 'landscape' : 'portrait',
              unit: 'mm',
              format: 'a4'
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
                    const pageWidth = (page.width * 25.4) / 96;
                    const pageHeight = (page.height * 25.4) / 96;
                    
                    const a4Width = 210;
                    const a4Height = 297;
                    const scaleX = a4Width / pageWidth;
                    const scaleY = a4Height / pageHeight;
                    const finalScale = Math.min(scaleX, scaleY, 1);
                    
                    const finalWidth = pageWidth * finalScale;
                    const finalHeight = pageHeight * finalScale;
                    
                    const offsetX = (a4Width - finalWidth) / 2;
                    const offsetY = (a4Height - finalHeight) / 2;
                    
                    const pageImageData = editor.canvas.toDataURL({
                      format: 'png',
                      quality: 1, // Máxima qualidade
                      multiplier: finalScale * 2, // 2x para melhor resolução
                      enableRetinaScaling: true,
                      withoutTransform: false,
                    });
                    
                    pdf.addImage(pageImageData, 'PNG', offsetX, offsetY, finalWidth, finalHeight);
                    resolve();
                  }, 100);
                });
              }
              
              isFirstPage = false;
            }
            
            editor.loadJson(originalCanvasData);
            const pdfBlob = pdf.output('blob');
            dataUrl = URL.createObjectURL(pdfBlob);
          } else {
            // Single page PDF export
            const pageWidth = (originalWidth * 25.4) / 96;
            const pageHeight = (originalHeight * 25.4) / 96;
            
            const pdf = new jsPDF({
              orientation: pageWidth > pageHeight ? 'landscape' : 'portrait',
              unit: 'mm',
              format: [pageWidth, pageHeight]
            });
            
            const pdfImageData = editor.canvas.toDataURL({
              format: 'png',
              quality: 1, // Máxima qualidade
              multiplier: 2, // 2x para melhor resolução
              enableRetinaScaling: true,
              withoutTransform: false,
            });
            
            pdf.addImage(pdfImageData, 'PNG', 0, 0, pageWidth, pageHeight);
            const pdfBlob = pdf.output('blob');
            dataUrl = URL.createObjectURL(pdfBlob);
          }
          break;
        case 'json':
          editor.saveJson();
          return;
        default:
          dataUrl = editor.canvas.toDataURL({
            format: 'png',
            quality: 1,
            multiplier: 2,
            enableRetinaScaling: true,
            withoutTransform: false,
          });
      }

      downloadFile(dataUrl, format.extension);
      toast.success('Exportação concluída com sucesso!');
    } catch (error: any) {
      console.error('Export failed:', error);
      
      // Tratar erro de Tainted Canvas especificamente
      if (error.name === 'SecurityError' || error.message?.includes('Tainted canvases')) {
        toast.error(
          'Erro ao exportar: Algumas imagens não podem ser exportadas devido a restrições de segurança. ' +
          'Certifique-se de que todas as imagens vêm de fontes confiáveis.',
          { duration: 5000 }
        );
      } else {
        toast.error('Erro ao exportar. Tente novamente.', { duration: 3000 });
      }
    }
  };

  const handleRenameConfirm = async (newName: string) => {
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newName }),
      });
      
      if (response.ok) {
        // Refresh the page to show updated name
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to rename project:', error);
    }
  };

  const categoryIcons = {
    image: Image,
    vector: Layers,
    document: FileText
  };

  return (
    <nav className="w-full flex items-center p-4 h-[68px] gap-x-8 border-b lg:pl-[34px]">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => router.push("/dashboard/projects")}
        className="mr-2"
        title="Voltar para projetos"
      >
        <ArrowLeft className="size-4" />
      </Button>
      <Logo />
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setRenameDialogOpen(true)}
        className="text-sm font-medium hover:bg-gray-100 px-3 py-1 h-auto"
      >
        {projectName}
      </Button>
      <div className="w-full flex items-center gap-x-1 h-full">
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="ghost">
              File
              <ChevronDown className="size-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-60">
            <DropdownMenuItem
              onClick={() => openFilePicker()}
              className="flex items-center gap-x-2"
            >
              <CiFileOn className="size-8" />
              <div>
                <p>Open</p>
                <p className="text-xs text-muted-foreground">
                  Open a JSON file
                </p>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Separator orientation="vertical" className="mx-2" />
        <Hint label="Select" side="bottom" sideOffset={10}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onChangeActiveTool("select")}
            className={cn(activeTool === "select" && "bg-gray-100")}
          >
            <MousePointerClick className="size-4" />
          </Button>
        </Hint>
        <Hint label="Undo" side="bottom" sideOffset={10}>
          <Button
            disabled={!editor?.canUndo()}
            variant="ghost"
            size="icon"
            onClick={() => editor?.onUndo()}
          >
            <Undo2 className="size-4" />
          </Button>
        </Hint>
        <Hint label="Redo" side="bottom" sideOffset={10}>
          <Button
            disabled={!editor?.canRedo()}
            variant="ghost"
            size="icon"
            onClick={() => editor?.onRedo()}
          >
            <Redo2 className="size-4" />
          </Button>
        </Hint>
        <Separator orientation="vertical" className="mx-2" />
        {isPending && ( 
          <div className="flex items-center gap-x-2">
            <Loader className="size-4 animate-spin text-muted-foreground" />
            <div className="text-xs text-muted-foreground">
              Saving...
            </div>
          </div>
        )}
        {!isPending && isError && ( 
          <div className="flex items-center gap-x-2">
            <BsCloudSlash className="size-[20px] text-muted-foreground" />
            <div className="text-xs text-muted-foreground">
              Failed to save
            </div>
          </div>
        )}
        {!isPending && !isError && ( 
          <div className="flex items-center gap-x-2">
            <BsCloudCheck className="size-[20px] text-muted-foreground" />
            <div className="text-xs text-muted-foreground">
              Saved
            </div>
          </div>
        )}
        <div className="ml-auto flex items-center gap-x-4">
          {onShare && (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => {
                if (!isPro) {
                  triggerPaywall();
                  return;
                }
                onShare();
              }}
            >
              <Users className="size-4 mr-2" />
              Share
              {!isPro && (
                <span className="ml-1 text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded">
                  Pro
                </span>
              )}
            </Button>
          )}
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost">
                Export
                <Download className="size-4 ml-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-60">
              {(['image', 'vector', 'document'] as const).map((category) => {
                const Icon = categoryIcons[category];
                const formats = getFormatsByCategory(category);
                
                return formats.map((format) => (
                  <DropdownMenuItem
                    key={format.id}
                    className="flex items-center gap-x-2"
                    onClick={() => handleExport(format.id)}
                  >
                    <Icon className="size-8" />
                    <div>
                      <p className="flex items-center gap-2">
                        {format.name}
                        {format.requiresPro && !isPro && (
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded">
                            Pro
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format.description}
                      </p>
                    </div>
                  </DropdownMenuItem>
                ));
              })}
            </DropdownMenuContent>
          </DropdownMenu>
          <UserButton />
        </div>
      </div>

      <ProjectNameDialog
        open={renameDialogOpen}
        onOpenChange={setRenameDialogOpen}
        onConfirm={handleRenameConfirm}
        defaultName={projectName}
        title="Rename Project"
        description="Enter a new name for your project"
        buttonText="Rename"
      />
    </nav>
  );
};
