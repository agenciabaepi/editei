import { useEffect, useRef } from 'react';
import { fabric } from 'fabric';

interface UseSnapGuidesProps {
  canvas: fabric.Canvas | null;
  workspace: fabric.Object | undefined;
  enabled?: boolean;
  margin?: number;
  snapThreshold?: number; // Distância em pixels para ativar o snap magnético
}

export const useSnapGuides = ({
  canvas,
  workspace,
  enabled = true,
  margin = 40,
  snapThreshold = 10, // 10px de threshold para snap magnético
}: UseSnapGuidesProps) => {
  const selectedObjectRef = useRef<fabric.Object | null>(null);
  const isDraggingRef = useRef(false);
  const lastSnapRef = useRef<{ x: boolean; y: boolean }>({ x: false, y: false });

  useEffect(() => {
    if (!canvas || !workspace || !enabled) {
      selectedObjectRef.current = null;
      canvas?.renderAll();
      return;
    }

    const workspaceRect = workspace as fabric.Rect;
    
    // Calcular centro absoluto do workspace usando getCenterPoint (método nativo do Fabric.js)
    const getWorkspaceCenter = () => {
      // getCenterPoint() retorna o centro real considerando todas as transformações
      const centerPoint = workspaceRect.getCenterPoint();
      return {
        x: centerPoint.x,
        y: centerPoint.y,
      };
    };

    // Snap magnético - guia o objeto para o centro quando próximo
    const applyMagneticSnap = (obj: fabric.Object) => {
      if (!isDraggingRef.current) return;

      const center = getWorkspaceCenter();
      
      // Usar getCenterPoint() para obter o centro real do objeto
      const objCenter = obj.getCenterPoint();
      
      // Calcular distâncias do centro
      const distX = Math.abs(objCenter.x - center.x);
      const distY = Math.abs(objCenter.y - center.y);

      let snappedX = false;
      let snappedY = false;

      // Snap horizontal (quando o centro X do objeto está próximo do centro X do workspace)
      if (distX <= snapThreshold) {
        // Calcular a diferença e ajustar o left
        const diffX = center.x - objCenter.x;
        obj.set({ left: (obj.left || 0) + diffX });
        snappedX = true;
        lastSnapRef.current.x = true;
      } else {
        lastSnapRef.current.x = false;
      }

      // Snap vertical (quando o centro Y do objeto está próximo do centro Y do workspace)
      if (distY <= snapThreshold) {
        // Calcular a diferença e ajustar o top
        const diffY = center.y - objCenter.y;
        obj.set({ top: (obj.top || 0) + diffY });
        snappedY = true;
        lastSnapRef.current.y = true;
      } else {
        lastSnapRef.current.y = false;
      }

      if (snappedX || snappedY) {
        obj.setCoords();
        canvas.renderAll();
      }
    };

    // Event listener para after:render (desenho nativo)
    const handleAfterRender = (options: any) => {
      // Só desenhar guias se houver um objeto selecionado
      if (!canvas || !workspace || !selectedObjectRef.current) return;
      
      // Verificar se o objeto selecionado não é o workspace ou uma margem
      const selected = selectedObjectRef.current;
      if (selected === workspace || (selected as any).name === 'margin-guide') {
        return;
      }
      
      const ctx = canvas.getContext();
      const vpt = canvas.viewportTransform || [1, 0, 0, 1, 0, 0];
      
      // Usar getCenterPoint() para obter o centro real do workspace
      const center = getWorkspaceCenter();
      const centerX = center.x;
      const centerY = center.y;
      
      const extension = 2000; // Estender muito além do workspace

      // Aplicar transformação do viewport para desenhar corretamente
      ctx.save();
      ctx.transform(vpt[0], vpt[1], vpt[2], vpt[3], vpt[4], vpt[5]);

      // Configurar estilo das guias (rosa neon como Canva) - mais finas
      ctx.strokeStyle = '#ff00ff'; // Rosa neon vibrante
      ctx.lineWidth = 0.5; // Linha mais fina
      ctx.setLineDash([]); // Linha lisa (sem tracejado)
      ctx.globalAlpha = 1;
      ctx.shadowColor = '#ff00ff';
      ctx.shadowBlur = 2;

      // Desenhar linha vertical central (centro X do workspace branco)
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - extension);
      ctx.lineTo(centerX, centerY + extension);
      ctx.stroke();

      // Desenhar linha horizontal central (centro Y do workspace branco)
      ctx.beginPath();
      ctx.moveTo(centerX - extension, centerY);
      ctx.lineTo(centerX + extension, centerY);
      ctx.stroke();

      ctx.restore();
    };

    // Detectar seleção de objeto
    const handleSelectionCreated = (e: fabric.IEvent) => {
      const selected = e.selected?.[0] || e.target;
      if (!selected || selected === workspace || (selected as any).name === 'margin-guide') {
        selectedObjectRef.current = null;
        canvas.renderAll();
        return;
      }
      selectedObjectRef.current = selected as fabric.Object;
      canvas.renderAll();
    };

    const handleSelectionUpdated = (e: fabric.IEvent) => {
      const selected = e.selected?.[0] || e.target;
      if (!selected || selected === workspace || (selected as any).name === 'margin-guide') {
        selectedObjectRef.current = null;
        canvas.renderAll();
        return;
      }
      selectedObjectRef.current = selected as fabric.Object;
      canvas.renderAll();
    };

    const handleObjectMoving = (e: fabric.IEvent) => {
      isDraggingRef.current = true;
      const obj = e.target as fabric.Object;
      
      if (obj && obj !== workspace && (obj as any).name !== 'margin-guide') {
        // Aplicar snap magnético durante o movimento
        applyMagneticSnap(obj);
      }
      
      canvas.renderAll();
    };

    const handleObjectModified = () => {
      isDraggingRef.current = false;
      lastSnapRef.current = { x: false, y: false };
      canvas.renderAll();
    };

    const handleSelectionCleared = () => {
      selectedObjectRef.current = null;
      lastSnapRef.current = { x: false, y: false };
      canvas.renderAll();
    };

    // Registrar eventos
    canvas.on('after:render', handleAfterRender);
    canvas.on('selection:created', handleSelectionCreated);
    canvas.on('selection:updated', handleSelectionUpdated);
    canvas.on('object:moving', handleObjectMoving);
    canvas.on('object:modified', handleObjectModified);
    canvas.on('selection:cleared', handleSelectionCleared);

    return () => {
      canvas.off('after:render', handleAfterRender);
      canvas.off('selection:created', handleSelectionCreated);
      canvas.off('selection:updated', handleSelectionUpdated);
      canvas.off('object:moving', handleObjectMoving);
      canvas.off('object:modified', handleObjectModified);
      canvas.off('selection:cleared', handleSelectionCleared);
      selectedObjectRef.current = null;
      lastSnapRef.current = { x: false, y: false };
    };
  }, [canvas, workspace, enabled, margin, snapThreshold]);

  return {};
};
