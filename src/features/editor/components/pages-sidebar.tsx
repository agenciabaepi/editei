import { useState } from "react";
import { ActiveTool, Editor } from "@/features/editor/types";
import { ToolSidebarClose } from "@/features/editor/components/tool-sidebar-close";
import { ToolSidebarHeader } from "@/features/editor/components/tool-sidebar-header";
import { PageManager } from "@/features/editor/components/page-manager";
import { usePageManager } from "@/features/editor/hooks/use-page-manager";
import { usePageContext } from "@/features/editor/contexts/page-context";
import { PageNameDialog } from "@/components/page-name-dialog";
import { cn } from "@/lib/utils";

interface PagesSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

export const PagesSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: PagesSidebarProps) => {
  const [showNameDialog, setShowNameDialog] = useState(false);
  
  // Use shared page manager from context only
  const pageManager = usePageContext();
  
  // If no context available, don't render the sidebar
  if (!pageManager) {
    return null;
  }

  const handleAddPage = (name?: string) => {
    if (name) {
      pageManager.addPage(name);
    } else {
      setShowNameDialog(true);
    }
  };

  const handleConfirmPageName = (name: string) => {
    pageManager.addPage(name);
  };

  const onClose = () => {
    onChangeActiveTool("select");
  };

  return (
    <aside
      className={cn(
        "bg-white relative border-r z-[40] w-[360px] h-full flex flex-col",
        activeTool === "pages" ? "visible" : "hidden",
      )}
    >
      <ToolSidebarHeader
        title="Pages"
        description="Manage your design pages"
      />
      
      <div className="flex-1 overflow-hidden">
        <PageManager
          pages={pageManager.pages}
          currentPageId={pageManager.currentPageId}
          onAddPage={handleAddPage}
          onDeletePage={pageManager.deletePage}
          onDuplicatePage={pageManager.duplicatePage}
          onSwitchToPage={pageManager.switchToPage}
          onLockPage={pageManager.lockPage}
          onUnlockPage={pageManager.unlockPage}
          onRenamePage={pageManager.renamePage}
          onReorderPages={pageManager.reorderPages}
        />
      </div>
      
      <PageNameDialog
        open={showNameDialog}
        onOpenChange={setShowNameDialog}
        onConfirm={handleConfirmPageName}
        defaultName={`Page ${pageManager.pages.length + 1}`}
      />
      
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
