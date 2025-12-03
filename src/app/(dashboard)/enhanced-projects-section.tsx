"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { safeFormatDistanceToNow } from "@/lib/date-utils";
import { 
  AlertTriangle, 
  CopyIcon, 
  FileIcon, 
  Loader, 
  MoreHorizontal, 
  Search,
  Trash,
  Edit,
  Grid3X3,
  List
} from "lucide-react";

import { useGetProjects } from "@/features/projects/api/use-get-projects";
import { useDeleteProject } from "@/features/projects/api/use-delete-project";
import { useDuplicateProject } from "@/features/projects/api/use-duplicate-project";
import { ProjectPreview } from "@/components/project-preview";

import {
  DropdownMenuContent,
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Table,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useConfirm } from "@/hooks/use-confirm";
import { ProjectNameDialog } from "@/components/project-name-dialog";

export const EnhancedProjectsSection = () => {
  const [ConfirmDialog, confirm] = useConfirm(
    "Tem certeza?",
    "Você está prestes a excluir este projeto.",
  );
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [projectToRename, setProjectToRename] = useState<{ id: string; name: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");
  const [selectedFolder, setSelectedFolder] = useState("all");
  
  const duplicateMutation = useDuplicateProject();
  const removeMutation = useDeleteProject();
  const router = useRouter();

  const onCopy = (id: string) => {
    duplicateMutation.mutate({ id });
  };

  const onRename = (id: string, currentName: string) => {
    setProjectToRename({ id, name: currentName });
    setRenameDialogOpen(true);
  };

  const handleRenameConfirm = async (newName: string) => {
    if (projectToRename) {
      try {
        const response = await fetch(`/api/projects/${projectToRename.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: newName }),
        });
        
        if (response.ok) {
          window.location.reload();
        }
      } catch (error) {
        console.error('Failed to rename project:', error);
      }
      setProjectToRename(null);
    }
  };

  const onDelete = async (id: string) => {
    const ok = await confirm();
    if (ok) {
      removeMutation.mutate({ id });
    }
  };

  const {
    data,
    status,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
  } = useGetProjects();

  if (status === "pending") {
    return (
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Projetos recentes</h3>
        <div className="flex flex-col gap-y-4 items-center justify-center h-32">
          <Loader className="size-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Projetos recentes</h3>
        <div className="flex flex-col gap-y-4 items-center justify-center h-32">
          <AlertTriangle className="size-6 text-muted-foreground" />
          <p className="text-muted-foreground text-sm">Falha ao carregar projetos</p>
        </div>
      </div>
    )
  }

  const allProjects = data?.pages?.flatMap(page => page.data) || [];
  const filteredProjects = allProjects.filter(project => 
    project.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!data.pages.length || !data.pages[0].data.length) {
    return (
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Projetos recentes</h3>
        <div className="flex flex-col gap-y-4 items-center justify-center h-32">
          <Search className="size-6 text-muted-foreground" />
          <p className="text-muted-foreground text-sm">Nenhum projeto encontrado</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4"> 
      <ConfirmDialog />
      
      {/* Header with Search and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h3 className="font-semibold text-lg">Projetos recentes</h3>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar projetos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-r-none"
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-l-none"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Folder Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Badge 
          variant={selectedFolder === "all" ? "default" : "outline"}
          className="cursor-pointer whitespace-nowrap"
          onClick={() => setSelectedFolder("all")}
        >
          Todos os Projetos ({allProjects.length})
        </Badge>
        <Badge 
          variant={selectedFolder === "recent" ? "default" : "outline"}
          className="cursor-pointer whitespace-nowrap"
          onClick={() => setSelectedFolder("recent")}
        >
          Recentes
        </Badge>
      </div>

      {/* Projects Display */}
      {viewMode === "list" ? (
        <Table>
          <TableBody>
            {filteredProjects.map((project: any) => (
              <TableRow key={project.id}>
                <TableCell
                  onClick={() => router.push(`/editor/${project.id}`)}
                  className="font-medium flex items-center gap-x-3 cursor-pointer"
                >
                  {project.thumbnail ? (
                    <div className="relative w-12 h-12 rounded overflow-hidden border flex-shrink-0">
                      <img
                        src={project.thumbnail}
                        alt={project.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0">
                      <FileIcon className="size-5 text-gray-400" />
                    </div>
                  )}
                  <span className="truncate">{project.name}</span>
                </TableCell>
                <TableCell
                  onClick={() => router.push(`/editor/${project.id}`)}
                  className="hidden md:table-cell cursor-pointer"
                >
                  {project.width} x {project.height} px
                </TableCell>
                <TableCell
                  onClick={() => router.push(`/editor/${project.id}`)}
                  className="hidden md:table-cell cursor-pointer"
                >
                  {safeFormatDistanceToNow(project.updatedAt, {
                    addSuffix: true,
                  })}
                </TableCell>
                <TableCell className="flex items-center justify-end">
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-60">
                      <DropdownMenuItem
                        className="h-10 cursor-pointer"
                        onClick={() => onRename(project.id, project.name)}
                      >
                        <Edit className="size-4 mr-2" />
                        Renomear
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="h-10 cursor-pointer"
                        disabled={duplicateMutation.isPending}
                        onClick={() => onCopy(project.id)}
                      >
                        <CopyIcon className="size-4 mr-2" />
                        Fazer uma cópia
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="h-10 cursor-pointer"
                        disabled={removeMutation.isPending}
                        onClick={() => onDelete(project.id)}
                      >
                        <Trash className="size-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredProjects.map((project: any) => (
            <div key={project.id} className="group cursor-pointer">
              <div 
                className="aspect-square rounded-lg mb-2 relative overflow-hidden hover:shadow-md transition-shadow border"
                onClick={() => router.push(`/editor/${project.id}`)}
                style={{ 
                  aspectRatio: project.width && project.height ? `${project.width}/${project.height}` : '1/1'
                }}
              >
                <ProjectPreview
                  json={project.json}
                  width={project.width}
                  height={project.height}
                  thumbnail={project.thumbnail}
                  className="absolute inset-0 w-full h-full"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <p className="opacity-0 group-hover:opacity-100 text-white font-medium text-sm transition-opacity">
                    Abrir no editor
                  </p>
                </div>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button size="icon" variant="secondary" className="w-7 h-7 bg-white/90 hover:bg-white">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onRename(project.id, project.name)}>
                        <Edit className="size-4 mr-2" />
                        Renomear
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onCopy(project.id)}>
                        <CopyIcon className="size-4 mr-2" />
                        Duplicar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDelete(project.id)}>
                        <Trash className="size-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <div className="space-y-1">
                <h4 className="font-medium text-sm truncate">{project.name}</h4>
                <p className="text-xs text-muted-foreground">
                  {safeFormatDistanceToNow(project.updatedAt, { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {hasNextPage && (
        <Button
          variant="ghost"
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          className="w-full"
        >
          {isFetchingNextPage ? (
            <Loader className="size-4 animate-spin mr-2" />
          ) : null}
          Carregar mais
        </Button>
      )}

      <ProjectNameDialog
        open={renameDialogOpen}
        onOpenChange={setRenameDialogOpen}
        onConfirm={handleRenameConfirm}
        defaultName={projectToRename?.name || ""}
        title="Renomear Projeto"
        description="Digite um novo nome para seu projeto"
        buttonText="Renomear"
      />
    </div>
  );
};
