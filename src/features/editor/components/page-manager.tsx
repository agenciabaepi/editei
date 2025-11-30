import React, { useState } from 'react';
import { Plus, Lock, Unlock, Copy, Trash2, Edit3, MoreHorizontal, GripVertical } from 'lucide-react';
import { Page } from '@/features/editor/types/page';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface PageManagerProps {
  pages: Page[];
  currentPageId: string;
  onAddPage: (name?: string) => void;
  onDeletePage: (pageId: string) => void;
  onDuplicatePage: (pageId: string) => void;
  onSwitchToPage: (pageId: string) => void;
  onLockPage: (pageId: string) => void;
  onUnlockPage: (pageId: string) => void;
  onRenamePage: (pageId: string, name: string) => void;
  onReorderPages: (fromIndex: number, toIndex: number) => void;
}

interface PageItemProps {
  page: Page;
  isActive: boolean;
  index: number;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onToggleLock: () => void;
  onRename: (name: string) => void;
}

const PageItem: React.FC<PageItemProps> = ({
  page,
  isActive,
  index,
  onSelect,
  onDelete,
  onDuplicate,
  onToggleLock,
  onRename,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(page.name);
  const [showActions, setShowActions] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleNameSubmit = () => {
    if (editName.trim() && editName !== page.name) {
      onRename(editName.trim());
    }
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSubmit();
    } else if (e.key === 'Escape') {
      setEditName(page.name);
      setIsEditing(false);
    }
  };

  return (
    <div
      className={cn(
        "group relative flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all",
        isActive 
          ? "bg-blue-50 border-blue-200 shadow-sm" 
          : "bg-white border-gray-200 hover:bg-gray-50",
        page.isLocked && "opacity-75"
      )}
      onClick={onSelect}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Drag Handle */}
      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical className="w-4 h-4 text-gray-400" />
      </div>

      {/* Page Thumbnail */}
      <div className="flex-shrink-0 w-12 h-9 bg-gray-100 rounded border overflow-hidden">
        {page.thumbnail ? (
          <img 
            src={page.thumbnail} 
            alt={`${page.name} thumbnail`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
            {index + 1}
          </div>
        )}
      </div>

      {/* Page Info */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <Input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleNameSubmit}
            onKeyDown={handleKeyPress}
            className="h-6 text-sm"
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <div className="space-y-1">
            <div className="text-sm font-medium truncate">{page.name}</div>
            <div className="text-xs text-gray-500">
              {page.width} × {page.height}
            </div>
          </div>
        )}
      </div>

      {/* Lock Status */}
      {page.isLocked && (
        <div className="flex-shrink-0">
          <Lock className="w-4 h-4 text-gray-500" />
        </div>
      )}

      {/* Actions */}
      {(showActions || isActive) && !isEditing && (
        <div className="flex-shrink-0 flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
          >
            <Edit3 className="w-3 h-3" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation();
              onToggleLock();
            }}
          >
            {page.isLocked ? (
              <Unlock className="w-3 h-3" />
            ) : (
              <Lock className="w-3 h-3" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
          >
            <Copy className="w-3 h-3" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteDialogOpen(true);
            }}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Page</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{page.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                onDelete();
                setDeleteDialogOpen(false);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export const PageManager: React.FC<PageManagerProps> = ({
  pages,
  currentPageId,
  onAddPage,
  onDeletePage,
  onDuplicatePage,
  onSwitchToPage,
  onLockPage,
  onUnlockPage,
  onRenamePage,
  onReorderPages,
}) => {
  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm">Pages</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAddPage()}
            className="h-8 w-8 p-0"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="text-xs text-gray-500">
          {pages.length} page{pages.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Pages List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {pages.map((page, index) => (
            <PageItem
              key={page.id}
              page={page}
              isActive={page.id === currentPageId}
              index={index}
              onSelect={() => onSwitchToPage(page.id)}
              onDelete={() => onDeletePage(page.id)}
              onDuplicate={() => onDuplicatePage(page.id)}
              onToggleLock={() => 
                page.isLocked ? onUnlockPage(page.id) : onLockPage(page.id)
              }
              onRename={(name) => onRenamePage(page.id, name)}
            />
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onAddPage()}
          className="w-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Page
        </Button>
      </div>
    </div>
  );
};
