import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, Loader, Upload, Trash2 } from "lucide-react";

import { ActiveTool, Editor } from "@/features/editor/types";
import { ToolSidebarClose } from "@/features/editor/components/tool-sidebar-close";
import { ToolSidebarHeader } from "@/features/editor/components/tool-sidebar-header";

import { useGetImages } from "@/features/images/api/use-get-images";
import { useUploadImage } from "@/features/images/api/use-upload-image";
import { useDeleteImage } from "@/features/images/api/use-delete-image";

import { cn } from "@/lib/utils";
import { FileUpload } from "@/components/ui/file-upload";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ImageSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

export const ImageSidebar = ({ editor, activeTool, onChangeActiveTool }: ImageSidebarProps) => {
  const { data, isLoading, isError } = useGetImages();
  const uploadImageMutation = useUploadImage();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);
  const deleteImageMutation = useDeleteImage();

  const onClose = () => {
    onChangeActiveTool("select");
  };

  const handleFileUpload = (file: File) => {
    uploadImageMutation.mutate(file, {
      onSuccess: (response) => {
        // Add image to canvas
        editor?.addImage(response.data.url);
      },
      onError: (error) => {
        console.error("Upload failed:", error);
      }
    });
  };

  const handleDeleteImage = (imageId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering the image click
    setImageToDelete(imageId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (imageToDelete) {
      deleteImageMutation.mutate(imageToDelete);
      setDeleteDialogOpen(false);
      setImageToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setImageToDelete(null);
  };

  return (
    <aside
      className={cn(
        "bg-white relative border-r z-[40] w-[360px] h-full flex flex-col",
        activeTool === "images" ? "visible" : "hidden"
      )}
    >
      <ToolSidebarHeader title="Images" description="Add images to your canvas" />
      <div className="p-4 border-b">
        <FileUpload
          onFileSelect={handleFileUpload}
          disabled={uploadImageMutation.isPending}
        >
          {uploadImageMutation.isPending ? (
            <>
              <Loader className="w-4 h-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Upload Image
            </>
          )}
        </FileUpload>
      </div>
      {isLoading && (
        <div className="flex items-center justify-center flex-1">
          <Loader className="size-4 text-muted-foreground animate-spin" />
        </div>
      )}
      {isError && (
        <div className="flex flex-col gap-y-4 items-center justify-center flex-1">
          <AlertTriangle className="size-4 text-muted-foreground" />
          <p className="text-muted-foreground text-xs">Failed to fetch images</p>
        </div>
      )}
      <ScrollArea>
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4">
            {data &&
              data.map((image) => {
                return (
                  <div
                    key={image.id}
                    className="relative w-full h-[100px] group"
                  >
                    <button
                      onClick={() => editor?.addImage(image.urls.regular)}
                      className="w-full h-full hover:opacity-75 transition bg-muted rounded-sm overflow-hidden border"
                    >
                      <img
                        src={image?.urls?.small || image?.urls?.thumb}
                        alt={image.alt_description || "Image"}
                        className="object-cover w-full h-full"
                        loading="lazy"
                      />
                    </button>
                    
                    {image.isUserUpload && (
                      <>
                        <div className="absolute top-1 right-1 bg-blue-500 text-white text-xs px-1 py-0.5 rounded">
                          Yours
                        </div>
                        <button
                          onClick={(e) => handleDeleteImage(image.id, e)}
                          className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 bg-red-500 hover:bg-red-600 text-white p-1 rounded transition-all"
                          title="Delete image"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </>
                    )}
                    
                    <Link
                      target="_blank"
                      href={image.links.html}
                      className="opacity-0 group-hover:opacity-100 absolute left-0 bottom-0 w-full text-[10px] truncate text-white hover:underline p-1 bg-black/50 text-left"
                    >
                      {image.user.name}
                    </Link>
                  </div>
                );
              })}
          </div>
        </div>
      </ScrollArea>
      <ToolSidebarClose onClick={onClose} />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Image</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this image? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={cancelDelete}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </aside>
  );
};
