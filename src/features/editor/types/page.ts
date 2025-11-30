export interface Page {
  id: string;
  name: string;
  isLocked: boolean;
  canvasData: string; // JSON string of canvas state
  width: number;
  height: number;
  background: string;
  createdAt: Date;
  updatedAt: Date;
  thumbnail?: string; // Base64 thumbnail for preview
}

export interface PageManagerState {
  pages: Page[];
  currentPageId: string;
  isLoading: boolean;
}

export interface PageManagerActions {
  addPage: (name?: string) => void;
  deletePage: (pageId: string) => void;
  duplicatePage: (pageId: string) => void;
  switchToPage: (pageId: string) => void;
  lockPage: (pageId: string) => void;
  unlockPage: (pageId: string) => void;
  renamePage: (pageId: string, name: string) => void;
  reorderPages: (fromIndex: number, toIndex: number) => void;
  updatePageThumbnail: (pageId: string, thumbnail: string) => void;
  saveCurrentPage: () => void;
}

export interface UsePageManagerProps {
  editor: any; // Editor instance
  initialPages?: Page[];
  onPagesChange?: (pages: Page[]) => void;
}
