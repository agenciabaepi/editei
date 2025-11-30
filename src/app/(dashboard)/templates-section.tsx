"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader, TriangleAlert } from "lucide-react";

import { usePaywall } from "@/features/subscriptions/hooks/use-paywall";

import { ResponseType, useGetTemplates } from "@/features/projects/api/use-get-templates";
import { useCreateProject } from "@/features/projects/api/use-create-project";
import { ProjectNameDialog } from "@/components/project-name-dialog";

import { TemplateCard } from "./template-card";

export const TemplatesSection = () => {
  const { shouldBlock, triggerPaywall } = usePaywall();
  const router = useRouter();
  const mutation = useCreateProject();
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ResponseType["data"][0] | null>(null);

  const { 
    data, 
    isLoading, 
    isError
  } = useGetTemplates({ page: "1", limit: "4" });

  const onClick = (template: ResponseType["data"][0]) => {
    if (template.isPro && shouldBlock) {
      triggerPaywall();
      return;
    }

    setSelectedTemplate(template);
    setShowNameDialog(true);
  };

  const handleConfirmProjectName = (name: string) => {
    if (!selectedTemplate) return;

    mutation.mutate(
      {
        name,
        json: selectedTemplate.json,
        width: selectedTemplate.width,
        height: selectedTemplate.height,
      },
      {
        onSuccess: ({ data }) => {
          router.push(`/editor/${data.id}`);
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">
          Comece com um template
        </h3>
        <div className="flex items-center justify-center h-32">
          <Loader className="size-6 text-muted-foreground animate-spin" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">
          Comece com um template
        </h3>
        <div className="flex flex-col gap-y-4 items-center justify-center h-32">
          <TriangleAlert className="size-6 text-muted-foreground" />
          <p>
            Falha ao carregar templates
          </p>
        </div>
      </div>
    );
  }

  if (!data?.length) {
    return null;
  }

  return (
    <div>
      <h3 className="font-semibold text-lg">
        Comece com um template
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 mt-4 gap-4">
        {data?.map((template: any) => (
          <TemplateCard
            key={template.id}
            title={template.name}
            imageSrc={template.thumbnailUrl || ""}
            onClick={() => onClick(template)}
            disabled={mutation.isPending}
            description={`${template.width} x ${template.height} px`}
            width={template.width}
            height={template.height}
            isPro={template.isPro}
          />
        ))}
      </div>
      
      <ProjectNameDialog
        open={showNameDialog}
        onOpenChange={setShowNameDialog}
        onConfirm={handleConfirmProjectName}
        defaultName={selectedTemplate ? `Projeto ${selectedTemplate.name}` : "Projeto Sem Título"}
        title="Nomeie Seu Projeto"
        description="Escolha um nome para seu novo projeto baseado neste template"
        isLoading={mutation.isPending}
      />
    </div>
  );
};
