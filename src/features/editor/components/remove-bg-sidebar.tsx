import Image from "next/image";
import { AlertTriangle, Loader } from "lucide-react";
import { useState, useEffect, useMemo } from "react";

import { usePaywall } from "@/features/subscriptions/hooks/use-paywall";

import { ActiveTool, Editor } from "@/features/editor/types";
import { ToolSidebarClose } from "@/features/editor/components/tool-sidebar-close";
import { ToolSidebarHeader } from "@/features/editor/components/tool-sidebar-header";

import { useRemoveBg } from "@/features/ai/api/use-remove-bg";
import { setRemoveBgProcessing } from "@/features/editor/components/remove-bg-overlay";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";

interface RemoveBgSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
};

export const RemoveBgSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: RemoveBgSidebarProps) => {
  const { shouldBlock, triggerPaywall } = usePaywall();
  const mutation = useRemoveBg();
  const [progress, setProgress] = useState(0);

  const selectedObject = editor?.selectedObjects[0];

  // @ts-ignore
  const imageSrc = selectedObject?._originalElement?.currentSrc;

  // Gera partículas com posições fixas para animação
  const particles = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 2 + Math.random() * 2,
    }));
  }, []);

  // Update global processing state for overlay
  useEffect(() => {
    setRemoveBgProcessing(mutation.isPending);
    return () => {
      setRemoveBgProcessing(false);
    };
  }, [mutation.isPending]);

  // Simulate progress animation
  useEffect(() => {
    if (mutation.isPending) {
      setProgress(0);
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev; // Stop at 90% until completion
          return prev + Math.random() * 15;
        });
      }, 500);
      return () => clearInterval(interval);
    } else {
      setProgress(0);
    }
  }, [mutation.isPending]);


  const onClose = () => {
    onChangeActiveTool("select");
  };

  const onClick = () => {
    if (shouldBlock) {
      triggerPaywall();
      return;
    }

    console.log('[Remove BG Sidebar] Starting mutation, imageSrc:', imageSrc?.substring(0, 50) + '...');
    
    mutation.mutate({
      image: imageSrc,
    }, {
      onSuccess: (response) => {
        console.log('[Remove BG Sidebar] Success response received');
        setProgress(100); // Complete progress
        
        // Reset progress after a brief delay
        setTimeout(() => setProgress(0), 500);
        
        try {
          const data = response.data;
          if (typeof data === 'string' && data.startsWith('data:')) {
            // Remove the original image first, then add the new one
            const selectedObject = editor?.selectedObjects[0];
            if (selectedObject && editor?.canvas) {
              editor.canvas.remove(selectedObject);
              editor.canvas.discardActiveObject();
              editor.canvas.renderAll();
            }
            // Add the new image without background
            console.log('[Remove BG Sidebar] Adding image without background');
            editor?.addImage(data);
            console.log('[Remove BG Sidebar] Image added successfully');
          } else {
            console.error('[Remove BG Sidebar] Invalid response format:', typeof data, data?.substring(0, 50));
          }
        } catch (error) {
          console.error('[Remove BG Sidebar] Error processing response:', error);
        }
      },
      onError: (error) => {
        console.error('[Remove BG Sidebar] Mutation error:', error);
      },
    });
  };

  return (
    <aside
      className={cn(
        "bg-white relative border-r z-[40] w-[360px] h-full flex flex-col",
        activeTool === "remove-bg" ? "visible" : "hidden",
      )}
    >
      <ToolSidebarHeader
        title="Background removal"
        description="Remove background from image using AI"
      />
      {!imageSrc && (
        <div className="flex flex-col gap-y-4 items-center justify-center flex-1">
          <AlertTriangle className="size-4 text-muted-foreground" />
          <p className="text-muted-foreground text-xs">
            Feature not available for this object
          </p>
        </div>
      )}
      {imageSrc && (
        <ScrollArea>
          <div className="p-4 space-y-4">
            <div className={cn(
              "relative aspect-square rounded-md overflow-hidden transition bg-muted",
              mutation.isPending && "opacity-50",
            )}>
              <Image
                src={imageSrc}
                fill
                alt="Image"
                className="object-cover"
              />
              {mutation.isPending && (
                <>
                  {/* Efeito de scan mágico */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-400/20 to-transparent animate-scan" />
                  {/* Partículas mágicas */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {particles.map((particle) => (
                      <div
                        key={particle.id}
                        className="absolute w-2 h-2 bg-blue-400 rounded-full animate-float"
                        style={{
                          left: `${particle.left}%`,
                          top: `${particle.top}%`,
                          animationDelay: `${particle.delay}s`,
                          animationDuration: `${particle.duration}s`,
                        }}
                      />
                    ))}
                  </div>
                  {/* Brilho pulsante */}
                  <div className="absolute inset-0 bg-gradient-radial from-blue-400/30 via-transparent to-transparent animate-pulse" />
                </>
              )}
            </div>
            
            {/* Progress bar */}
            {mutation.isPending && (
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Analisando imagem...</span>
                  <span>{Math.round(progress)}%</span>
                </div>
              </div>
            )}
            <Button
              disabled={mutation.isPending}
              onClick={onClick}
              className="w-full"
            >
              {mutation.isPending ? (
                <>
                  <Loader className="size-4 mr-2 animate-spin" />
                  Analisando imagem...
                </>
              ) : (
                "Remover fundo"
              )}
            </Button>
            {mutation.isError && (
              <p className="text-sm text-red-500 text-center">
                {mutation.error instanceof Error ? mutation.error.message : 'Erro ao remover fundo'}
              </p>
            )}
          </div>
        </ScrollArea>
      )}
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
