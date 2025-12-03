"use client";

import { useState } from "react";
import { 
  Plus,
  FolderOpen,
  LayoutTemplate,
  Wallet
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { useCreateProject } from "@/features/projects/api/use-create-project";
import { ProjectNameDialog } from "@/components/project-name-dialog";

import { SidebarItem } from "./sidebar-item";

export const SidebarRoutes = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const mutation = useCreateProject();

  const handleCreate = () => {
    setDialogOpen(true);
  };

  const handleCreateProject = (name: string) => {
    mutation.mutate(
      {
        name,
        json: "",
        width: 900,
        height: 1200,
      },
      {
        onSuccess: ({ data }) => {
          setDialogOpen(false);
          router.push(`/editor/${data.id}`);
        },
      }
    );
  };

  return (
    <>
      <div className="flex flex-col items-center gap-y-6 flex-1 py-6">
        {/* Botão Criar - Destaque */}
        <button
          onClick={handleCreate}
          className="flex flex-col items-center justify-center group"
        >
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg flex items-center justify-center hover:shadow-xl hover:scale-105 transition-all">
            <Plus className="size-6 text-white stroke-[3]" />
          </div>
          <span className="text-xs font-medium mt-2 text-purple-700">
            Criar
          </span>
        </button>

        {/* Itens do Menu */}
        <div className="flex flex-col gap-y-2 w-full">
          <SidebarItem 
            href="/dashboard/projects" 
            icon={FolderOpen} 
            label="Projetos" 
            isActive={pathname === "/dashboard/projects" || pathname === "/dashboard"} 
          />
          <SidebarItem 
            href="/dashboard/templates" 
            icon={LayoutTemplate} 
            label="Templates" 
            isActive={pathname === "/dashboard/templates"} 
          />
          <SidebarItem 
            href="/dashboard/brand" 
            icon={Wallet} 
            label="Marca" 
            isActive={pathname === "/dashboard/brand"} 
          />
        </div>
      </div>

      <ProjectNameDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onConfirm={handleCreateProject}
        defaultName="Meu Design"
        title="Criar Novo Projeto"
        description="Escolha um nome para seu novo projeto"
        isLoading={mutation.isPending}
      />
    </>
  );
};
