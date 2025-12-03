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
  const isRenderingRef = useRef(false);
  const handleAfterRenderRef = useRef<((options: any) => void) | null>(null);
  const lastRenderTimeRef = useRef<number>(0);
  const isListenerRegisteredRef = useRef<boolean>(false);
  const RENDER_THROTTLE = 16; // ~60fps (16ms entre renders)

  useEffect(() => {
    if (!canvas || !workspace || !enabled) {
      selectedObjectRef.current = null;
      // Limpar listeners antes de sair
      if (handleAfterRenderRef.current && canvas) {
        canvas.off('after:render', handleAfterRenderRef.current);
      }
      handleAfterRenderRef.current = null;
      canvas?.renderAll();
      return;
    }

    const workspaceRect = workspace as fabric.Rect;
    
    // Calcular centro do workspace usando getCenterPoint (considera transformações do viewport)
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
      
      // Usar getCenterPoint() para obter o centro real do objeto (considera transformações)
      const objCenter = obj.getCenterPoint();
      
      // Calcular distâncias do centro
      const distX = Math.abs(objCenter.x - center.x);
      const distY = Math.abs(objCenter.y - center.y);

      let snappedX = false;
      let snappedY = false;

      // Snap horizontal (quando o centro X do objeto está próximo do centro X do workspace)
      if (distX <= snapThreshold) {
        // Calcular a diferença e ajustar o left para centralizar
        const diffX = center.x - objCenter.x;
        const currentLeft = obj.left || 0;
        obj.set({ left: currentLeft + diffX });
        snappedX = true;
        lastSnapRef.current.x = true;
      } else {
        lastSnapRef.current.x = false;
      }

      // Snap vertical (quando o centro Y do objeto está próximo do centro Y do workspace)
      if (distY <= snapThreshold) {
        // Calcular a diferença e ajustar o top para centralizar
        const diffY = center.y - objCenter.y;
        const currentTop = obj.top || 0;
        obj.set({ top: currentTop + diffY });
        snappedY = true;
        lastSnapRef.current.y = true;
      } else {
        lastSnapRef.current.y = false;
      }

      if (snappedX || snappedY) {
        obj.setCoords();
        canvas.requestRenderAll();
      }
    };

    // Event listener para after:render (desenho nativo)
    // Criar handler apenas uma vez para evitar duplicação
    if (!handleAfterRenderRef.current) {
      handleAfterRenderRef.current = (options: any) => {
        // Throttle: só renderizar a cada 16ms (60fps)
        const now = Date.now();
        if (now - lastRenderTimeRef.current < RENDER_THROTTLE) {
          return;
        }
        lastRenderTimeRef.current = now;
        
        // Prevenir renderização duplicada no mesmo frame
        if (isRenderingRef.current) return;
        isRenderingRef.current = true;
        
        // Só desenhar guias se houver um objeto selecionado
        if (!canvas || !workspace || !selectedObjectRef.current) {
          isRenderingRef.current = false;
          return;
        }
        
        // Verificar se o objeto selecionado não é o workspace ou uma margem
        const selected = selectedObjectRef.current;
        if (selected === workspace || (selected as any).name === 'margin-guide' || (selected as any).name === 'clip') {
          isRenderingRef.current = false;
          return;
        }
        
        const ctx = canvas.getContext();
        if (!ctx) {
          isRenderingRef.current = false;
          return;
        }
        
        // Calcular centro visual do workspace
        const center = getWorkspaceCenter();
        const centerX = center.x;
        const centerY = center.y;
        
        const extension = 2000; // Estender muito além do workspace

        // Aplicar transformação do viewport para desenhar corretamente
        const vpt = canvas.viewportTransform || [1, 0, 0, 1, 0, 0];
        ctx.save();
        ctx.transform(vpt[0], vpt[1], vpt[2], vpt[3], vpt[4], vpt[5]);
        
        // Configurar estilo das guias (rosa neon como Canva) - mais finas
        ctx.strokeStyle = '#ff00ff'; // Rosa neon vibrante
        ctx.lineWidth = 0.5; // Linha mais fina
        ctx.setLineDash([]); // Linha lisa (sem tracejado)
        ctx.globalAlpha = 1;
        ctx.shadowColor = 'transparent'; // Remover sombra para evitar blur/duplicação
        ctx.shadowBlur = 0;
        ctx.lineCap = 'butt'; // Evitar extensões nas pontas

        // Desenhar APENAS UMA linha vertical central (centro X do workspace branco)
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - extension);
        ctx.lineTo(centerX, centerY + extension);
        ctx.stroke();

        // Desenhar APENAS UMA linha horizontal central (centro Y do workspace branco)
        ctx.beginPath();
        ctx.moveTo(centerX - extension, centerY);
        ctx.lineTo(centerX + extension, centerY);
        ctx.stroke();

        ctx.restore();
        
        // Reset flag no próximo frame
        requestAnimationFrame(() => {
          isRenderingRef.current = false;
        });
      };
    }
    
    const handleAfterRender = handleAfterRenderRef.current;
    
    // Função unificada para atualizar o objeto selecionado
    const updateSelectedObject = () => {
      const activeObject = canvas.getActiveObject();
      if (activeObject && activeObject !== workspace && (activeObject as any).name !== 'margin-guide' && (activeObject as any).name !== 'clip') {
        selectedObjectRef.current = activeObject;
      } else {
        selectedObjectRef.current = null;
      }
      canvas.requestRenderAll();
    };

    // Detectar seleção de objeto
    const handleSelectionCreated = (e: fabric.IEvent) => {
      updateSelectedObject();
    };

    const handleSelectionUpdated = (e: fabric.IEvent) => {
      updateSelectedObject();
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

    // Registrar eventos APENAS se ainda não foram registrados
    // IMPORTANTE: Remover listeners anteriores antes de adicionar novos
    if (handleAfterRender) {
      canvas.off('after:render', handleAfterRender);
    }
    canvas.off('selection:created', handleSelectionCreated);
    canvas.off('selection:updated', handleSelectionUpdated);
    canvas.off('object:moving', handleObjectMoving);
    canvas.off('object:modified', handleObjectModified);
    canvas.off('selection:cleared', handleSelectionCleared);
    
    // Agora adicionar os listeners
    if (handleAfterRender) {
      canvas.on('after:render', handleAfterRender);
    }
    canvas.on('selection:created', handleSelectionCreated);
    canvas.on('selection:updated', handleSelectionUpdated);
    canvas.on('object:moving', handleObjectMoving);
    canvas.on('object:modified', handleObjectModified);
    canvas.on('selection:cleared', handleSelectionCleared);
    
    isListenerRegisteredRef.current = true;

    return () => {
      // Limpar todos os listeners
      if (handleAfterRenderRef.current) {
        canvas.off('after:render', handleAfterRenderRef.current);
      }
      canvas.off('selection:created', handleSelectionCreated);
      canvas.off('selection:updated', handleSelectionUpdated);
      canvas.off('object:moving', handleObjectMoving);
      canvas.off('object:modified', handleObjectModified);
      canvas.off('selection:cleared', handleSelectionCleared);
      selectedObjectRef.current = null;
      lastSnapRef.current = { x: false, y: false };
      handleAfterRenderRef.current = null;
      isListenerRegisteredRef.current = false;
    };
  }, [canvas, workspace, enabled, margin, snapThreshold]);

  return {};
};
