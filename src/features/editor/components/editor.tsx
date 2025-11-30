"use client";

import { fabric } from "fabric";
import debounce from "lodash.debounce";
import { useCallback, useEffect, useRef, useState } from "react";

import { ResponseType } from "@/features/projects/api/use-get-project";
import { useUpdateProject } from "@/features/projects/api/use-update-project";
import { useEditor } from "@/features/editor/hooks/use-editor";

import { 
  ActiveTool, 
  selectionDependentTools
} from "@/features/editor/types";
import { Navbar } from "@/features/editor/components/navbar";
import { Sidebar } from "@/features/editor/components/sidebar";
import { Toolbar } from "@/features/editor/components/toolbar";
import { Footer } from "@/features/editor/components/footer";
import { ShapeSidebar } from "@/features/editor/components/shape-sidebar";
import { FillColorSidebar } from "@/features/editor/components/fill-color-sidebar";
import { StrokeColorSidebar } from "@/features/editor/components/stroke-color-sidebar";
import { StrokeWidthSidebar } from "@/features/editor/components/stroke-width-sidebar";
import { OpacitySidebar } from "@/features/editor/components/opacity-sidebar";
import { TextSidebar } from "@/features/editor/components/text-sidebar";
import { FontSidebar } from "@/features/editor/components/font-sidebar";
import { ImageSidebar } from "@/features/editor/components/image-sidebar";
import { FilterSidebar } from "@/features/editor/components/filter-sidebar";
import { AiSidebar } from "@/features/editor/components/ai-sidebar";
import { RemoveBgSidebar } from "@/features/editor/components/remove-bg-sidebar";
import { DrawSidebar } from "@/features/editor/components/draw-sidebar";
import { SettingsSidebar } from "@/features/editor/components/settings-sidebar";
import { TemplateSidebar } from "@/features/editor/components/template-sidebar";
import { ExportSidebar } from "@/features/editor/components/export-sidebar";
import { PagesSidebar } from "@/features/editor/components/pages-sidebar";
import { LayersSidebar } from "@/features/editor/components/layers-sidebar";
import { FloatingLayersPanel } from "@/features/editor/components/floating-layers-panel";
import { DraggableLayersPanel } from "@/features/editor/components/draggable-layers-panel-clean";
import { SidebarLayersPanel } from "@/features/editor/components/sidebar-layers-panel";
import { useLayersPosition } from "@/features/editor/hooks/use-layers-position";
import { BorderRadiusSidebar } from "@/features/editor/components/border-radius-sidebar";
import { ShadowSidebar } from "@/features/editor/components/shadow-sidebar";
import { GradientSidebar } from "@/features/editor/components/gradient-sidebar";
import { BackgroundSidebar } from "@/features/editor/components/background-sidebar";
import { EnhancedDrawSidebar } from "@/features/editor/components/enhanced-draw-sidebar";
import { ShareDialog } from "@/components/share-dialog";
import { CommentSystem } from "@/components/comment-system";
import { CollaboratorCursors } from "@/components/collaborator-cursors";
import { useCollaboration } from "@/features/collaboration/hooks/use-collaboration";
import { usePageManager } from "@/features/editor/hooks/use-page-manager";
import { PageProvider } from "@/features/editor/contexts/page-context";

interface EditorProps {
  initialData: any;
};

export const Editor = ({ initialData }: EditorProps) => {
  const { mutate } = useUpdateProject(initialData.id);

  const [activeTool, setActiveTool] = useState<ActiveTool>("select");
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showFloatingLayers, setShowFloatingLayers] = useState(true);

  // Check if this is a guest user to disable auto-save
  const isGuest = (initialData as any).isGuest;
  const disableAutoSave = (initialData as any).disableAutoSave;

  // Initialize layers position manager
  const layersPosition = useLayersPosition();

  // Initialize collaboration
  const collaboration = useCollaboration({
    projectId: initialData.id,
    onCanvasUpdate: (data) => {
      // Handle real-time canvas updates from other collaborators
      console.log('Canvas updated by collaborator:', data);
    },
  });

  const onClearSelection = useCallback(() => {
    if (selectionDependentTools.includes(activeTool as any)) {
      setActiveTool("select");
    }
  }, [activeTool]);

  const debouncedSave = useCallback(
    debounce(
      (values: { 
        json: string,
        height: number,
        width: number,
      }) => {
        // Don't save if auto-save is disabled (for guest users)
        if (!disableAutoSave) {
          mutate(values);
        }
    },
    500
  ), [mutate, disableAutoSave]);

  const { init, editor } = useEditor({
    defaultState: initialData.json,
    defaultWidth: initialData.width,
    defaultHeight: initialData.height,
    clearSelectionCallback: onClearSelection,
    saveCallback: debouncedSave,
  });

  // Initialize page manager
  const pageManager = usePageManager({
    editor,
    onPagesChange: (pages) => {
      console.log('Pages updated:', pages);
    },
  });

  const onChangeActiveTool = useCallback(
    (tool: ActiveTool) => {
      // Handle drawing mode transitions
      if (tool === "draw") {
        editor?.enableDrawingMode();
      } else if (activeTool === "draw") {
        editor?.disableDrawingMode();
      }

      if (tool === "comments") {
        setShowComments(!showComments);
        return;
      }

      if (tool === activeTool) {
        return setActiveTool("select");
      }

      setActiveTool(tool);
    },
    [activeTool, showComments, editor]
  );

  const canvasRef = useRef(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = new fabric.Canvas(canvasRef.current, {
      controlsAboveOverlay: true,
      preserveObjectStacking: true,
    });

    // Wait for next tick to ensure container is rendered
    const timeoutId = setTimeout(() => {
      if (containerRef.current) {
        init({
          initialCanvas: canvas,
          initialContainer: containerRef.current,
        });
      }
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      canvas.dispose();
    };
  }, [init]);

  return (
    <PageProvider value={{
      ...pageManager,
    }}>
      <div className="h-full flex flex-col">
        <Navbar
          id={initialData.id}
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
          onShare={() => setShowShareDialog(true)}
          projectName={initialData.name}
          showFloatingLayers={showFloatingLayers}
          onToggleFloatingLayers={() => setShowFloatingLayers(!showFloatingLayers)}
          layersPosition={layersPosition}
        />
        <div className="flex-1 h-[calc(100%-68px)] flex relative">
        {/* Left Sidebar Layers Panel */}
        {layersPosition.config.position === 'sidebar-left' && layersPosition.isVisible && (
          <SidebarLayersPanel 
            editor={editor} 
            side="left" 
            onPositionChange={layersPosition.updatePosition}
          />
        )}
        <Sidebar
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <ShapeSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <FillColorSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <StrokeColorSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <StrokeWidthSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <OpacitySidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <TextSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <FontSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <ImageSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <FilterSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <AiSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <RemoveBgSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <DrawSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <SettingsSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <TemplateSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <ExportSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <PagesSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <LayersSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <BorderRadiusSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <ShadowSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <GradientSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <BackgroundSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <EnhancedDrawSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <main className="bg-muted flex-1 overflow-auto relative flex flex-col">
          {/* Draggable Layers Panel */}
          {layersPosition.config.position.startsWith('floating') && layersPosition.isVisible && (
            <DraggableLayersPanel
              editor={editor}
              position={layersPosition.config.position}
              onPositionChange={layersPosition.updatePosition}
              onClose={() => layersPosition.setVisible(false)}
            />
          )}
          <Toolbar
            editor={editor}
            activeTool={activeTool}
            onChangeActiveTool={onChangeActiveTool}
            key={JSON.stringify(editor?.canvas.getActiveObject())}
          />
          <div className="flex-1 h-[calc(100%-124px)] bg-muted relative" ref={containerRef}>
            <div className="bg-white h-full">
              <canvas ref={canvasRef} />
              <CollaboratorCursors
                collaborators={collaboration.collaborators}
                currentUserId={collaboration.currentUser.id}
              />
            </div>
          </div>
          <Footer editor={editor} />
        </main>
        {showComments && (
          <CommentSystem
            comments={collaboration.comments}
            currentUserId={collaboration.currentUser.id}
            userPermission={collaboration.currentUser.permission}
            isGuest={collaboration.currentUser.isGuest}
            onAddComment={collaboration.addComment}
            onReplyToComment={collaboration.replyToComment}
            onResolveComment={collaboration.resolveComment}
            onDeleteComment={collaboration.deleteComment}
          />
        )}
        
        {/* Right Sidebar Layers Panel */}
        {layersPosition.config.position === 'sidebar-right' && layersPosition.isVisible && (
          <SidebarLayersPanel 
            editor={editor} 
            side="right" 
            onPositionChange={layersPosition.updatePosition}
          />
        )}
        
        {/* Legacy Floating Layers Panel - kept for backward compatibility */}
        {!layersPosition.isVisible && (
          <FloatingLayersPanel
            editor={editor}
            isVisible={showFloatingLayers}
            onToggle={() => setShowFloatingLayers(!showFloatingLayers)}
          />
        )}
      </div>
      
      <ShareDialog
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        projectName={initialData.name}
        shareSettings={collaboration.shareSettings}
        collaborators={collaboration.collaborators}
        shareLink={collaboration.shareLink?.token ? `${typeof window !== 'undefined' ? window.location.origin : ''}/shared/${initialData.id}?token=${collaboration.shareLink.token}` : undefined}
        isOwner={collaboration.isOwner}
        onUpdateSettings={collaboration.updateShareSettings}
        onGenerateLink={collaboration.generateShareLink}
        onRevokeLink={collaboration.revokeShareLink}
        onInviteCollaborator={collaboration.inviteCollaborator}
        onRemoveCollaborator={collaboration.removeCollaborator}
        onUpdatePermission={collaboration.updateCollaboratorPermission}
      />
      </div>
    </PageProvider>
  );
};
