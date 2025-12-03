"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { fabric } from "fabric";
import { ActiveTool, Editor } from "@/features/editor/types";
import { ToolSidebarClose } from "@/features/editor/components/tool-sidebar-close";
import { ToolSidebarHeader } from "@/features/editor/components/tool-sidebar-header";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Crown, Loader2, Shapes } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface Element {
  id: string;
  name: string;
  description: string | null;
  category: string;
  file_url: string;
  thumbnail_url: string | null;
  width: number | null;
  height: number | null;
  file_type: string;
  tags: string[];
  is_pro: boolean;
}

interface ElementsSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

const CATEGORIES = [
  { value: 'all', label: 'Todas as Categorias' },
  { value: 'png', label: 'PNG' },
  { value: '3d', label: 'Modelo 3D' },
  { value: 'icon', label: 'Ícone' },
  { value: 'illustration', label: 'Ilustração' },
  { value: 'shape', label: 'Forma' },
  { value: 'sticker', label: 'Adesivo' },
  { value: 'other', label: 'Outro' }
];

export const ElementsSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: ElementsSidebarProps) => {
  const [elements, setElements] = useState<Element[]>([]);
  const [filteredElements, setFilteredElements] = useState<Element[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasLoadedRef = useRef(false);

  // Carregar elementos apenas uma vez quando o sidebar é aberto
  const fetchElements = useCallback(async (category?: string, search?: string) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (category && category !== 'all') {
        params.append('category', category);
      }
      if (search) {
        params.append('search', search);
      }

      const response = await fetch(`/api/elements?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setElements(data.elements || []);
        setFilteredElements(data.elements || []);
        hasLoadedRef.current = true;
      }
    } catch (error) {
      console.error("Erro ao buscar elementos:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Carregar elementos apenas quando o sidebar é aberto pela primeira vez
  useEffect(() => {
    if (activeTool === "elements" && !hasLoadedRef.current) {
      fetchElements();
    }
  }, [activeTool, fetchElements]);

  // Filtrar localmente quando categoria ou busca mudar (sem nova requisição)
  useEffect(() => {
    if (!hasLoadedRef.current) return;

    // Limpar timeout anterior
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce para busca
    searchTimeoutRef.current = setTimeout(() => {
      let filtered = [...elements];

      // Filtrar por categoria
      if (categoryFilter !== 'all') {
        filtered = filtered.filter(el => el.category === categoryFilter);
      }

      // Filtrar por busca
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filtered = filtered.filter(el => 
          el.name.toLowerCase().includes(searchLower) ||
          (el.description && el.description.toLowerCase().includes(searchLower)) ||
          el.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }

      setFilteredElements(filtered);
    }, 300); // 300ms de debounce

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, categoryFilter, elements]);

  // Reset quando fechar o sidebar
  useEffect(() => {
    if (activeTool !== "elements") {
      hasLoadedRef.current = false;
      setElements([]);
      setFilteredElements([]);
      setSearchTerm("");
      setCategoryFilter("all");
    }
  }, [activeTool]);

  const handleAddElement = async (element: Element) => {
    if (!editor?.canvas) return;

    try {
      // For image elements (PNG, JPEG, SVG)
      if (element.file_type.startsWith('image/')) {
        fabric.Image.fromURL(element.file_url, (img) => {
          // Set dimensions if provided
          if (element.width && element.height) {
            img.scaleToWidth(element.width);
            img.scaleToHeight(element.height);
          } else {
            // Default size
            img.scaleToWidth(200);
          }

          // Center the image on canvas
          const center = editor.canvas.getCenter();
          img.set({
            left: center.left,
            top: center.top,
            originX: 'center',
            originY: 'center',
          });

          editor.canvas.add(img);
          editor.canvas.setActiveObject(img);
          editor.canvas.renderAll();
        });
      } 
      // Para modelos 3D (GLB, GLTF) - por enquanto, mostraremos um placeholder
      // No futuro, você pode integrar um visualizador 3D
      else if (element.file_type.startsWith('model/')) {
        // Criar um retângulo placeholder para modelos 3D
        const placeholder = new fabric.Rect({
          width: element.width || 200,
          height: element.height || 200,
          fill: '#e5e7eb',
          stroke: '#9ca3af',
          strokeWidth: 2,
        });

        const center = editor.canvas.getCenter();
        placeholder.set({
          left: center.left,
          top: center.top,
          originX: 'center',
          originY: 'center',
        });

        // Adicionar label de texto
        const text = new fabric.Text('Modelo 3D', {
          fontSize: 16,
          fill: '#6b7280',
          originX: 'center',
          originY: 'center',
        });

        const group = new fabric.Group([placeholder, text], {
          left: center.left,
          top: center.top,
        });

        editor.canvas.add(group);
        editor.canvas.setActiveObject(group);
        editor.canvas.renderAll();
      }
    } catch (error) {
      console.error("Erro ao adicionar elemento:", error);
    }
  };

  const onClose = () => {
    onChangeActiveTool("select");
  };

  return (
    <aside
      className={cn(
        "bg-white relative border-r z-[40] w-[360px] h-full flex flex-col",
        activeTool === "elements" ? "visible" : "hidden",
      )}
    >
      <ToolSidebarHeader
        title="Elementos"
        description="Adicione PNG, modelos 3D, ícones e mais"
      />
      
      <div className="p-4 border-b space-y-2">
        <div>
          <Input
            placeholder="Buscar elementos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(cat => (
                <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredElements.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">Nenhum elemento encontrado</p>
              <p className="text-xs mt-1">Adicione elementos no painel admin</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredElements.map((element) => (
                <div
                  key={element.id}
                  className="group relative cursor-pointer rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all overflow-hidden"
                  onClick={() => handleAddElement(element)}
                >
                  {/* Thumbnail */}
                  <div className="aspect-square bg-gray-100 relative overflow-hidden">
                    {element.thumbnail_url ? (
                      <img
                        src={element.thumbnail_url}
                        alt={element.name}
                        className="w-full h-full object-cover"
                      />
                    ) : element.file_type.startsWith('image/') ? (
                      <img
                        src={element.file_url}
                        alt={element.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Shapes className="h-8 w-8" />
                      </div>
                    )}
                    
                    {/* Pro Badge */}
                    {element.is_pro && (
                      <div className="absolute top-1 right-1">
                        <Crown className="h-4 w-4 text-yellow-500" />
                      </div>
                    )}

                    {/* Category Badge */}
                    <div className="absolute bottom-1 left-1">
                      <Badge variant="secondary" className="text-xs">
                        {element.category}
                      </Badge>
                    </div>
                  </div>

                  {/* Name */}
                  <div className="p-2">
                    <p className="text-xs font-medium truncate">{element.name}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};

