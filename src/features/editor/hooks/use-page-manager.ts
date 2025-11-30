import { useState, useCallback, useEffect } from 'react';
import { fabric } from 'fabric';
import { v4 as uuidv4 } from 'uuid';
import { Page, PageManagerState, PageManagerActions, UsePageManagerProps } from '@/features/editor/types/page';

export const usePageManager = ({ 
  editor, 
  initialPages = [], 
  onPagesChange 
}: UsePageManagerProps): PageManagerState & PageManagerActions => {
  const [state, setState] = useState<PageManagerState>(() => {
    if (initialPages.length > 0) {
      return {
        pages: initialPages,
        currentPageId: initialPages[0].id,
        isLoading: false,
      };
    }
    
    // Create default first page
    const defaultPage: Page = {
      id: uuidv4(),
      name: 'Page 1',
      isLocked: false,
      canvasData: '',
      width: 800,
      height: 600,
      background: '#ffffff',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    return {
      pages: [defaultPage],
      currentPageId: defaultPage.id,
      isLoading: false,
    };
  });

  // Save current page canvas data
  const saveCurrentPage = useCallback(() => {
    if (!editor?.canvas) return;
    
    setState(prev => {
      const currentPage = prev.pages.find(p => p.id === prev.currentPageId);
      if (!currentPage || currentPage.isLocked) return prev;

      const canvasData = JSON.stringify(editor.canvas.toJSON());
      const workspace = editor.getWorkspace();
      
      return {
        ...prev,
        pages: prev.pages.map(page => 
          page.id === prev.currentPageId 
            ? {
                ...page,
                canvasData,
                width: workspace?.width || page.width,
                height: workspace?.height || page.height,
                background: workspace?.fill || page.background,
                updatedAt: new Date(),
              }
            : page
        ),
      };
    });
  }, [editor]);

  // Generate thumbnail for page
  const generateThumbnail = useCallback((canvas: fabric.Canvas): string => {
    const scale = 0.2; // 20% scale for thumbnail
    return canvas.toDataURL({
      format: 'png',
      quality: 0.8,
      multiplier: scale,
    });
  }, []);

  // Add new page
  const addPage = useCallback((name?: string) => {
    setState(prev => {
      // Save current page data first (synchronously)
      let updatedPages = prev.pages;
      const currentPage = prev.pages.find(p => p.id === prev.currentPageId);
      
      if (currentPage && !currentPage.isLocked && editor?.canvas) {
        const canvasData = JSON.stringify(editor.canvas.toJSON());
        const workspace = editor.getWorkspace();
        
        updatedPages = prev.pages.map(page => 
          page.id === prev.currentPageId 
            ? {
                ...page,
                canvasData,
                width: workspace?.width || page.width,
                height: workspace?.height || page.height,
                background: workspace?.fill || page.background,
                updatedAt: new Date(),
              }
            : page
        );
      }
      
      // Get current page dimensions to match
      const currentWorkspace = editor?.getWorkspace();
      
      const pageNumber = updatedPages.length + 1;
      const newPage: Page = {
        id: uuidv4(),
        name: name || `Page ${pageNumber}`,
        isLocked: false,
        canvasData: '',
        width: currentWorkspace?.width || currentPage?.width || 800,
        height: currentWorkspace?.height || currentPage?.height || 600,
        background: currentWorkspace?.fill || currentPage?.background || '#ffffff',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Clear canvas and setup workspace for new page
      if (editor?.canvas) {
        setTimeout(() => {
          editor.canvas.clear();
          
          // Create new workspace for the page
          const workspace = new fabric.Rect({
            width: newPage.width,
            height: newPage.height,
            name: "clip",
            fill: newPage.background,
            selectable: false,
            hasControls: false,
            shadow: new fabric.Shadow({
              color: "rgba(0,0,0,0.8)",
              blur: 5,
            }),
          });

          editor.canvas.add(workspace);
          editor.canvas.centerObject(workspace);
          editor.canvas.clipPath = workspace;
          editor.canvas.renderAll();
          
          // Auto-zoom to fit
          setTimeout(() => {
            editor.autoZoom();
          }, 100);
        }, 50);
      }

      return {
        ...prev,
        pages: [...updatedPages, newPage],
        currentPageId: newPage.id,
      };
    });
  }, [editor]);

  // Delete page
  const deletePage = useCallback((pageId: string) => {
    if (state.pages.length <= 1) {
      console.warn('Cannot delete the last page');
      return false;
    }

    const pageIndex = state.pages.findIndex(p => p.id === pageId);
    if (pageIndex === -1) return;

    const newPages = state.pages.filter(p => p.id !== pageId);
    let newCurrentPageId = state.currentPageId;

    // If deleting current page, switch to another page
    if (pageId === state.currentPageId) {
      const newIndex = pageIndex > 0 ? pageIndex - 1 : 0;
      newCurrentPageId = newPages[newIndex].id;
    }

    setState(prev => ({
      ...prev,
      pages: newPages,
      currentPageId: newCurrentPageId,
    }));

    // Load the new current page if we switched
    if (pageId === state.currentPageId) {
      const pageToLoad = newPages.find(p => p.id === newCurrentPageId);
      if (pageToLoad && editor?.canvas) {
        if (pageToLoad.canvasData) {
          editor.loadJson(pageToLoad.canvasData);
        } else {
          editor.canvas.clear();
          editor.changeSize({ width: pageToLoad.width, height: pageToLoad.height });
          editor.changeBackground(pageToLoad.background);
        }
      }
    }
  }, [state.pages, state.currentPageId, editor]);

  // Duplicate page
  const duplicatePage = useCallback((pageId: string) => {
    const pageToClone = state.pages.find(p => p.id === pageId);
    if (!pageToClone) return;

    saveCurrentPage(); // Save current state

    const duplicatedPage: Page = {
      ...pageToClone,
      id: uuidv4(),
      name: `${pageToClone.name} Copy`,
      isLocked: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const pageIndex = state.pages.findIndex(p => p.id === pageId);
    const newPages = [
      ...state.pages.slice(0, pageIndex + 1),
      duplicatedPage,
      ...state.pages.slice(pageIndex + 1),
    ];

    setState(prev => ({
      ...prev,
      pages: newPages,
      currentPageId: duplicatedPage.id,
    }));

    // Load duplicated page
    if (editor?.canvas) {
      if (duplicatedPage.canvasData) {
        editor.loadJson(duplicatedPage.canvasData);
      } else {
        editor.canvas.clear();
        editor.changeSize({ width: duplicatedPage.width, height: duplicatedPage.height });
        editor.changeBackground(duplicatedPage.background);
      }
    }
  }, [state.pages, saveCurrentPage, editor]);

  // Switch to page
  const switchToPage = useCallback((pageId: string) => {
    setState(prev => {
      if (pageId === prev.currentPageId) return prev;

      // Save current page data first (synchronously)
      let updatedPages = prev.pages;
      const currentPage = prev.pages.find(p => p.id === prev.currentPageId);
      
      if (currentPage && !currentPage.isLocked && editor?.canvas) {
        const canvasData = JSON.stringify(editor.canvas.toJSON());
        const workspace = editor.getWorkspace();
        
        updatedPages = prev.pages.map(page => 
          page.id === prev.currentPageId 
            ? {
                ...page,
                canvasData,
                width: workspace?.width || page.width,
                height: workspace?.height || page.height,
                background: workspace?.fill || page.background,
                updatedAt: new Date(),
              }
            : page
        );
      }

      const pageToLoad = updatedPages.find(p => p.id === pageId);
      if (!pageToLoad) return prev;

      // Load page data
      if (editor?.canvas) {
        setTimeout(() => {
          if (pageToLoad.canvasData && pageToLoad.canvasData.trim() !== '') {
            try {
              editor.loadJson(pageToLoad.canvasData);
            } catch (error) {
              console.error('Failed to load page data:', error);
              // Fallback to creating new workspace
              editor.canvas.clear();
              createWorkspace(pageToLoad);
            }
          } else {
            editor.canvas.clear();
            createWorkspace(pageToLoad);
          }
        }, 50);
      }

      return {
        ...prev,
        pages: updatedPages,
        currentPageId: pageId,
      };
    });

    // Helper function to create workspace
    function createWorkspace(page: Page) {
      if (!editor?.canvas) return;
      
      const workspace = new fabric.Rect({
        width: page.width,
        height: page.height,
        name: "clip",
        fill: page.background,
        selectable: false,
        hasControls: false,
        shadow: new fabric.Shadow({
          color: "rgba(0,0,0,0.8)",
          blur: 5,
        }),
      });

      editor.canvas.add(workspace);
      editor.canvas.centerObject(workspace);
      editor.canvas.clipPath = workspace;
      editor.canvas.renderAll();
      
      // Auto-zoom to fit
      setTimeout(() => {
        editor.autoZoom();
      }, 100);
    }
  }, [editor]);

  // Lock page
  const lockPage = useCallback((pageId: string) => {
    setState(prev => ({
      ...prev,
      pages: prev.pages.map(page => 
        page.id === pageId ? { ...page, isLocked: true } : page
      ),
    }));
  }, []);

  // Unlock page
  const unlockPage = useCallback((pageId: string) => {
    setState(prev => ({
      ...prev,
      pages: prev.pages.map(page => 
        page.id === pageId ? { ...page, isLocked: false } : page
      ),
    }));
  }, []);

  // Rename page
  const renamePage = useCallback((pageId: string, name: string) => {
    setState(prev => ({
      ...prev,
      pages: prev.pages.map(page => 
        page.id === pageId ? { ...page, name, updatedAt: new Date() } : page
      ),
    }));
  }, []);

  // Reorder pages
  const reorderPages = useCallback((fromIndex: number, toIndex: number) => {
    setState(prev => {
      const newPages = [...prev.pages];
      const [movedPage] = newPages.splice(fromIndex, 1);
      newPages.splice(toIndex, 0, movedPage);
      return { ...prev, pages: newPages };
    });
  }, []);

  // Update page thumbnail
  const updatePageThumbnail = useCallback((pageId: string, thumbnail: string) => {
    setState(prev => ({
      ...prev,
      pages: prev.pages.map(page => 
        page.id === pageId ? { ...page, thumbnail } : page
      ),
    }));
  }, []);

  // Auto-save current page when canvas changes
  useEffect(() => {
    if (!editor?.canvas) return;

    const handleCanvasChange = () => {
      const currentPage = state.pages.find(p => p.id === state.currentPageId);
      if (currentPage && !currentPage.isLocked) {
        // Generate thumbnail
        const thumbnail = generateThumbnail(editor.canvas);
        updatePageThumbnail(state.currentPageId, thumbnail);
      }
    };

    const canvas = editor.canvas;
    canvas.on('object:added', handleCanvasChange);
    canvas.on('object:removed', handleCanvasChange);
    canvas.on('object:modified', handleCanvasChange);

    return () => {
      canvas.off('object:added', handleCanvasChange);
      canvas.off('object:removed', handleCanvasChange);
      canvas.off('object:modified', handleCanvasChange);
    };
  }, [editor, state.currentPageId, state.pages, generateThumbnail, updatePageThumbnail]);

  // Notify parent of pages change
  useEffect(() => {
    onPagesChange?.(state.pages);
  }, [state.pages, onPagesChange]);

  return {
    ...state,
    addPage,
    deletePage,
    duplicatePage,
    switchToPage,
    lockPage,
    unlockPage,
    renamePage,
    reorderPages,
    updatePageThumbnail,
    saveCurrentPage,
  };
};
