"use client";

import { useState } from "react";
import { 
  Trash2, 
  RotateCcw, 
  Search, 
  AlertTriangle,
  FileText,
  Calendar,
  Loader
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useDeletedProjects, useRestoreProject, usePermanentDeleteProject } from "@/features/projects/api/use-deleted-projects";
import { toast } from "sonner";

export const TrashManager = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [emptyTrashDialogOpen, setEmptyTrashDialogOpen] = useState(false);
  
  const { data: deletedProjects = [], error } = useDeletedProjects();
  const restoreProject = useRestoreProject();
  const permanentDeleteProject = usePermanentDeleteProject();

  const filteredProjects = deletedProjects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRestore = (project: any) => {
    setSelectedProject(project);
    setRestoreDialogOpen(true);
  };

  const handleDelete = (project: any) => {
    setSelectedProject(project);
    setDeleteDialogOpen(true);
  };

  const confirmRestore = async () => {
    if (!selectedProject) return;
    
    try {
      setIsLoading(true);
      await restoreProject.mutateAsync(selectedProject.id);
      toast.success("Project restored successfully");
      setIsLoading(false);
      setRestoreDialogOpen(false);
      setSelectedProject(null);
    } catch (error: any) {
      setIsLoading(false);
      if (error.message.includes("Project limit reached") || error.message.includes("Delete some projects")) {
        toast.error(error.message);
      } else {
        toast.error("Failed to restore project");
      }
      console.error("Failed to restore project:", error);
    }
  };

  const confirmDelete = async () => {
    if (!selectedProject) return;
    
    try {
      setIsLoading(true);
      await permanentDeleteProject.mutateAsync(selectedProject.id);
    } catch (error) {
      console.error("Failed to permanently delete project:", error);
    } finally {
      setIsLoading(false);
      setDeleteDialogOpen(false);
      setSelectedProject(null);
    }
  };

  const handleEmptyTrash = () => {
    setEmptyTrashDialogOpen(true);
  };

  const confirmEmptyTrash = async () => {
    try {
      setIsLoading(true);
      // Delete all projects in trash
      for (const project of deletedProjects) {
        await permanentDeleteProject.mutateAsync(project.id);
      }
    } catch (error) {
      console.error("Failed to empty trash:", error);
    } finally {
      setIsLoading(false);
      setEmptyTrashDialogOpen(false);
    }
  };

  const getDaysLeft = (deletedAt: string) => {
    const deleted = new Date(deletedAt);
    const now = new Date();
    const thirtyDaysLater = new Date(deleted.getTime() + (30 * 24 * 60 * 60 * 1000));
    const daysLeft = Math.ceil((thirtyDaysLater.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
    return Math.max(0, daysLeft);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900">Items in trash</h3>
              <p className="text-sm text-blue-700 mt-1">
                Deleted projects are kept for 30 days before being permanently removed. 
                You can restore them anytime during this period.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="font-semibold text-lg">Deleted Projects</h2>
          <Badge variant="secondary">{filteredProjects.length} items</Badge>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search deleted projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleEmptyTrash}
            disabled={filteredProjects.length === 0}
          >
            Empty Trash
          </Button>
        </div>
      </div>

      {/* Deleted Projects */}
      {filteredProjects.length === 0 ? (
        <div className="flex flex-col gap-y-4 items-center justify-center h-64 border-2 border-dashed border-muted rounded-lg">
          <Trash2 className="size-12 text-muted-foreground" />
          <div className="text-center">
            <p className="text-muted-foreground text-lg mb-2">Trash is empty</p>
            <p className="text-muted-foreground text-sm">Deleted projects will appear here</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-muted rounded-lg">
                      <FileText className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-medium">{project.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span>{project.width} × {project.height} px</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Deleted {formatDate(project.deleted_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={getDaysLeft(project.deleted_at) <= 7 ? "destructive" : "secondary"}
                      className="text-xs"
                    >
                      {getDaysLeft(project.deleted_at)} days left
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRestore(project)}
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Restore
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(project)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Forever
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Restore Confirmation Dialog */}
      <Dialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to restore &quot;{selectedProject?.name}&quot;? 
              It will be moved back to your projects.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRestoreDialogOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={confirmRestore} disabled={isLoading}>
              {isLoading && <Loader className="w-4 h-4 mr-2 animate-spin" />}
              Restore Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Permanent Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Forever</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete &quot;{selectedProject?.name}&quot;? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isLoading}>
              {isLoading && <Loader className="w-4 h-4 mr-2 animate-spin" />}
              Delete Forever
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Empty Trash Confirmation Dialog */}
      <Dialog open={emptyTrashDialogOpen} onOpenChange={setEmptyTrashDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Empty Trash</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete all {deletedProjects.length} projects in trash? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmptyTrashDialogOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmEmptyTrash} disabled={isLoading}>
              {isLoading && <Loader className="w-4 h-4 mr-2 animate-spin" />}
              Empty Trash
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
