"use client";

import { useState } from "react";
import Image from "next/image";
import { 
  Upload, 
  Trash2, 
  Download, 
  Grid3X3,
  List,
  Loader,
  AlertTriangle
} from "lucide-react";

import { useGetImages } from "@/features/images/api/use-get-images";
import { useUploadImage } from "@/features/images/api/use-upload-image";
import { useDeleteImage } from "@/features/images/api/use-delete-image";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { FileUpload } from "@/components/ui/file-upload";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const ImageLibrary = () => {
  const { data, isLoading, isError } = useGetImages();
  const uploadImageMutation = useUploadImage();
  const deleteImageMutation = useDeleteImage();
  
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);

  const handleFileUpload = (file: File) => {
    uploadImageMutation.mutate(file);
  };

  const handleDeleteImage = (imageId: string) => {
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

  const handleDownloadImage = async (imageUrl: string, fileName?: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || `image-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download image:', error);
    }
  };

  // Filter user uploaded images only
  const userImages = data?.filter(image => image.isUserUpload) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col gap-y-4 items-center justify-center h-64">
        <AlertTriangle className="size-8 text-muted-foreground" />
        <p className="text-muted-foreground">Failed to load images</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardContent className="p-6">
          <FileUpload
            onFileSelect={handleFileUpload}
            disabled={uploadImageMutation.isPending}
          >
            {uploadImageMutation.isPending ? (
              <>
                <Loader className="w-6 h-6 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-6 h-6 mr-2" />
                Upload New Image
              </>
            )}
          </FileUpload>
        </CardContent>
      </Card>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="font-semibold text-lg">Your Images</h2>
          <Badge variant="secondary">{userImages.length} images</Badge>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-r-none"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-l-none"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Images Display */}
      {userImages.length === 0 ? (
        <div className="flex flex-col gap-y-4 items-center justify-center h-64 border-2 border-dashed border-muted rounded-lg">
          <Upload className="size-12 text-muted-foreground" />
          <div className="text-center">
            <p className="text-muted-foreground text-lg mb-2">No images uploaded yet</p>
            <p className="text-muted-foreground text-sm">Upload your first image to get started</p>
          </div>
        </div>
      ) : (
        <div className={viewMode === "grid" 
          ? "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4" 
          : "space-y-4"
        }>
          {userImages.map((image) => (
            <div key={image.id} className={viewMode === "grid" ? "group" : "flex items-center gap-4 p-4 border rounded-lg"}>
              {viewMode === "grid" ? (
                <>
                  <div className="aspect-square bg-muted rounded-lg overflow-hidden relative group-hover:shadow-md transition-shadow">
                    <img
                      src={image.urls.small}
                      alt={image.alt_description || "Uploaded image"}
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button 
                        size="sm" 
                        variant="secondary"
                        onClick={() => handleDownloadImage(image.urls.full, image.alt_description)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleDeleteImage(image.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-medium truncate">{image.alt_description}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={image.urls.small}
                      alt={image.alt_description || "Uploaded image"}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{image.alt_description}</h4>
                    <p className="text-sm text-muted-foreground">Uploaded image</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDownloadImage(image.urls.full, image.alt_description)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleDeleteImage(image.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

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
    </div>
  );
};
