"use client";

import { useState, useEffect } from "react";
import { 
  ActiveTool, 
  Editor, 
} from "@/features/editor/types";
import { ToolSidebarClose } from "@/features/editor/components/tool-sidebar-close";
import { ToolSidebarHeader } from "@/features/editor/components/tool-sidebar-header";
import { isTextType } from "@/features/editor/utils";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, RotateCcw } from "lucide-react";

interface TextSpacingSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
};

export const TextSpacingSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: TextSpacingSidebarProps) => {
  const selectedObject = editor?.selectedObjects[0];
  const isText = isTextType(selectedObject?.type);

  const initialCharSpacing = editor?.getActiveCharSpacing() || 0;
  const initialLineHeight = editor?.getActiveLineHeight() || 1.16;

  const [charSpacing, setCharSpacing] = useState(initialCharSpacing);
  const [lineHeight, setLineHeight] = useState(initialLineHeight);

  // Update values when selection changes
  useEffect(() => {
    if (isText && editor) {
      const currentCharSpacing = editor.getActiveCharSpacing();
      const currentLineHeight = editor.getActiveLineHeight();
      setCharSpacing(currentCharSpacing);
      setLineHeight(currentLineHeight);
    }
  }, [selectedObject, isText, editor]);

  const onClose = () => {
    onChangeActiveTool("select");
  };

  const onChangeCharSpacing = (value: number) => {
    editor?.changeCharSpacing(value);
    setCharSpacing(value);
  };

  const onChangeLineHeight = (value: number) => {
    editor?.changeLineHeight(value);
    setLineHeight(value);
  };

  const resetCharSpacing = () => {
    onChangeCharSpacing(0);
  };

  const resetLineHeight = () => {
    onChangeLineHeight(1.16);
  };

  const incrementCharSpacing = () => {
    onChangeCharSpacing(charSpacing + 1);
  };

  const decrementCharSpacing = () => {
    onChangeCharSpacing(charSpacing - 1);
  };

  const incrementLineHeight = () => {
    onChangeLineHeight(Math.round((lineHeight + 0.1) * 10) / 10);
  };

  const decrementLineHeight = () => {
    onChangeLineHeight(Math.max(0.5, Math.round((lineHeight - 0.1) * 10) / 10));
  };

  if (!isText) {
    return (
      <aside
        className={cn(
          "bg-white relative border-r z-[40] w-[360px] h-full flex flex-col",
          activeTool === "text-spacing" ? "visible" : "hidden",
        )}
      >
        <ToolSidebarHeader
          title="Espaçamento de Texto"
          description="Controle profissional de espaçamento"
        />
        <div className="flex flex-col gap-y-4 items-center justify-center flex-1">
          <p className="text-muted-foreground text-xs text-center px-4">
            Selecione um objeto de texto para editar o espaçamento
          </p>
        </div>
        <ToolSidebarClose onClick={onClose} />
      </aside>
    );
  }

  return (
    <aside
      className={cn(
        "bg-white relative border-r z-[40] w-[360px] h-full flex flex-col",
        activeTool === "text-spacing" ? "visible" : "hidden",
      )}
    >
      <ToolSidebarHeader
        title="Espaçamento de Texto"
        description="Controle profissional de espaçamento"
      />
      <ScrollArea>
        <div className="p-4 space-y-6">
          {/* Espaçamento entre Caracteres (Letter Spacing) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Espaçamento entre Caracteres</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={charSpacing}
                  onChange={(e) => onChangeCharSpacing(parseFloat(e.target.value) || 0)}
                  className="w-20 h-8 text-sm"
                  step="0.5"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={resetCharSpacing}
                  title="Resetar"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Slider
                value={[charSpacing]}
                onValueChange={(values) => onChangeCharSpacing(values[0])}
                min={-20}
                max={100}
                step={0.5}
                className="w-full"
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>-20</span>
                <span className="font-medium">{charSpacing.toFixed(1)}px</span>
                <span>100</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={decrementCharSpacing}
                className="flex-1"
              >
                <Minus className="h-4 w-4 mr-1" />
                Diminuir
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={incrementCharSpacing}
                className="flex-1"
              >
                <Plus className="h-4 w-4 mr-1" />
                Aumentar
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Controla o espaçamento horizontal entre cada caractere do texto
            </p>
          </div>

          <Separator />

          {/* Altura da Linha (Line Height) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Altura da Linha</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={lineHeight.toFixed(2)}
                  onChange={(e) => onChangeLineHeight(parseFloat(e.target.value) || 1.16)}
                  className="w-20 h-8 text-sm"
                  step="0.1"
                  min="0.5"
                  max="5"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={resetLineHeight}
                  title="Resetar"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Slider
                value={[lineHeight]}
                onValueChange={(values) => onChangeLineHeight(values[0])}
                min={0.5}
                max={5}
                step={0.1}
                className="w-full"
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>0.5</span>
                <span className="font-medium">{lineHeight.toFixed(2)}x</span>
                <span>5.0</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={decrementLineHeight}
                className="flex-1"
              >
                <Minus className="h-4 w-4 mr-1" />
                Diminuir
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={incrementLineHeight}
                className="flex-1"
              >
                <Plus className="h-4 w-4 mr-1" />
                Aumentar
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Controla o espaçamento vertical entre linhas de texto (múltiplo do tamanho da fonte)
            </p>
          </div>

          <Separator />

          {/* Presets Rápidos */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Presets Rápidos</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onChangeCharSpacing(0);
                  onChangeLineHeight(1.16);
                }}
                className="text-xs"
              >
                Padrão
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onChangeCharSpacing(2);
                  onChangeLineHeight(1.5);
                }}
                className="text-xs"
              >
                Confortável
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onChangeCharSpacing(1);
                  onChangeLineHeight(1.2);
                }}
                className="text-xs"
              >
                Compacto
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onChangeCharSpacing(3);
                  onChangeLineHeight(1.8);
                }}
                className="text-xs"
              >
                Espaçado
              </Button>
            </div>
          </div>
        </div>
      </ScrollArea>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};

