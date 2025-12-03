"use client";

import { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import { Loader, FileIcon } from "lucide-react";

interface ProjectPreviewProps {
  json?: string | null;
  width?: number;
  height?: number;
  thumbnail?: string | null;
  className?: string;
}

export const ProjectPreview = ({ 
  json, 
  width = 800, 
  height = 600, 
  thumbnail,
  className = ""
}: ProjectPreviewProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasInstanceRef = useRef<fabric.Canvas | null>(null);
  const [isLoading, setIsLoading] = useState(!thumbnail);
  const [previewUrl, setPreviewUrl] = useState<string | null>(thumbnail || null);

  useEffect(() => {
    // If we have a thumbnail, use it directly
    if (thumbnail) {
      setPreviewUrl(thumbnail);
      setIsLoading(false);
      return;
    }

    // If no JSON, show fallback
    if (!json || json.trim() === '' || json === '{}') {
      setIsLoading(false);
      return;
    }

    // Wait for canvas element to be available
    const timer = setTimeout(() => {
      if (!canvasRef.current) {
        setIsLoading(false);
        return;
      }

      let canvas: fabric.Canvas | null = null;
      
      try {
        // Create a temporary canvas for rendering (hidden)
        canvas = new fabric.Canvas(canvasRef.current, {
          width: width || 800,
          height: height || 600,
          renderOnAddRemove: false,
        });
        
        canvasInstanceRef.current = canvas;

        // Parse and load JSON
        const canvasData = JSON.parse(json);
        
        canvas.loadFromJSON(canvasData, () => {
          // Render the canvas
          canvas?.renderAll();
          
          // Wait a bit for rendering to complete
          setTimeout(() => {
            try {
              // Generate thumbnail at 40% scale for better quality
              const scale = 0.4;
              const workspace = canvas?.getObjects().find((obj: any) => obj.name === "clip");
              
              let thumbnailOptions: any = {
                format: 'png',
                quality: 1.0, // Maximum quality
                multiplier: scale,
              };

              if (workspace) {
                const workspaceRect = workspace as fabric.Rect;
                thumbnailOptions = {
                  ...thumbnailOptions,
                  left: workspaceRect.left || 0,
                  top: workspaceRect.top || 0,
                  width: workspaceRect.width || width,
                  height: workspaceRect.height || height,
                };
              }
              
              const dataUrl = canvas?.toDataURL(thumbnailOptions);
              if (dataUrl) {
                setPreviewUrl(dataUrl);
              }
              
              setIsLoading(false);
            } catch (error) {
              console.error('Error generating thumbnail:', error);
              setIsLoading(false);
            } finally {
              // Cleanup
              if (canvas) {
                canvas.dispose();
                canvasInstanceRef.current = null;
              }
            }
          }, 150);
        }, (error: any) => {
          console.error('Error loading canvas JSON:', error);
          setIsLoading(false);
          if (canvas) {
            canvas.dispose();
            canvasInstanceRef.current = null;
          }
        });
      } catch (error) {
        console.error('Error generating preview:', error);
        setIsLoading(false);
        if (canvas) {
          canvas.dispose();
          canvasInstanceRef.current = null;
        }
      }
    }, 50);

    return () => {
      clearTimeout(timer);
      if (canvasInstanceRef.current) {
        canvasInstanceRef.current.dispose();
        canvasInstanceRef.current = null;
      }
    };
  }, [json, width, height, thumbnail]);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 ${className}`}>
        <Loader className="size-6 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (previewUrl) {
    return (
      <>
        <img
          src={previewUrl}
          alt="Project preview"
          className={`w-full h-full object-cover ${className}`}
        />
        <canvas 
          ref={canvasRef} 
          className="hidden" 
          style={{ display: 'none', visibility: 'hidden' }}
        />
      </>
    );
  }

  // Fallback when no preview can be generated
  return (
    <>
      <div className={`flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 ${className}`}>
        <FileIcon className="size-8 text-gray-400" />
      </div>
      <canvas 
        ref={canvasRef} 
        className="hidden" 
        style={{ display: 'none', visibility: 'hidden' }}
      />
    </>
  );
};

