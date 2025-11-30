"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Sparkles, Palette, Zap } from "lucide-react";

import { useCreateProject } from "@/features/projects/api/use-create-project";
import { ProjectNameDialog } from "@/components/project-name-dialog";

import { Button } from "@/components/ui/button";
import { useState } from "react";

export const Banner = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const router = useRouter();
  const mutation = useCreateProject();

  const onClick = () => {
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
        onError: () => {
          // Keep dialog open on error so user can retry
        }
      }
    );
  };

  return (
    <div className="text-white aspect-[5/1] min-h-[248px] flex gap-x-6 p-6 items-center rounded-xl bg-gradient-to-br from-[#667eea] via-[#764ba2] to-[#f093fb] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
      
      <div className="rounded-full size-28 items-center justify-center bg-white/20 backdrop-blur-sm hidden md:flex border border-white/30">
        <div className="rounded-full size-20 flex items-center justify-center bg-white shadow-lg">
          <div className="relative">
            <Palette className="h-8 w-8 text-[#667eea]" />
            <Zap className="h-4 w-4 text-[#f093fb] absolute -top-1 -right-1" />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-y-3 flex-1">
        <div className="space-y-1">
          <h1 className="text-xl md:text-3xl font-bold tracking-tight">
            Dê Vida à Sua Visão Criativa
          </h1>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-yellow-300" />
            <span className="text-sm font-medium text-white/90">Alimentado por IA</span>
          </div>
        </div>
        <p className="text-sm md:text-base text-white/80 leading-relaxed max-w-md">
          Transforme suas ideias em designs incríveis sem esforço. Envie imagens, escolha templates, 
          ou comece do zero—nossas ferramentas inteligentes se adaptam ao seu fluxo criativo.
        </p>
        <div className="flex gap-3 mt-2">
          <Button
            disabled={mutation.isPending}
            onClick={onClick}
            className="bg-white text-[#667eea] hover:bg-white/90 font-semibold px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                Criando...
              </>
            ) : (
              <>
                <Palette className="size-4 mr-2" />
                Criar Agora
              </>
            )}
          </Button>
          <div className="flex items-center text-xs text-white/70 gap-1">
            <Zap className="h-3 w-3" />
            <span>Grátis para começar</span>
          </div>
        </div>
      </div>

      <ProjectNameDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onConfirm={handleCreateProject}
        defaultName="Meu Design"
        isLoading={mutation.isPending}
      />
    </div>
  );
};
