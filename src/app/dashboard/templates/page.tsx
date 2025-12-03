"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader, TriangleAlert, Search } from "lucide-react";
import { usePaywall } from "@/features/subscriptions/hooks/use-paywall";
import { ResponseType, useGetTemplates } from "@/features/projects/api/use-get-templates";
import { useCreateProject } from "@/features/projects/api/use-create-project";
import { ProjectNameDialog } from "@/components/project-name-dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { TemplateCard } from "../../(dashboard)/template-card";

export default function TemplatesPage() {
  const { shouldBlock, triggerPaywall } = usePaywall();
  const router = useRouter();
  const mutation = useCreateProject();
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ResponseType["data"][0] | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { 
    data, 
    isLoading, 
    isError
  } = useGetTemplates({ page: "1", limit: "100" });

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

  // Filtrar templates por termo de busca
  const filteredTemplates = data?.filter((template: any) => 
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${template.width}x${template.height}`.includes(searchTerm)
  ) || [];

  // Separar templates PRO e gratuitos
  const proTemplates = filteredTemplates.filter((t: any) => t.isPro);
  const freeTemplates = filteredTemplates.filter((t: any) => !t.isPro);

  return (
    <div className="flex flex-col space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Templates</h1>
        <p className="text-gray-600 mt-1">
          Escolha um template para começar seu design. Novos templates serão adicionados em breve.
        </p>
      </div>

      {/* Barra de busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Buscar templates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Estatísticas */}
      {data && data.length > 0 && (
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <Badge variant="outline">
            {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} encontrado{filteredTemplates.length !== 1 ? 's' : ''}
          </Badge>
          {freeTemplates.length > 0 && (
            <Badge variant="outline" className="text-green-600">
              {freeTemplates.length} gratuito{freeTemplates.length !== 1 ? 's' : ''}
            </Badge>
          )}
          {proTemplates.length > 0 && (
            <Badge variant="outline" className="text-purple-600">
              {proTemplates.length} PRO
            </Badge>
          )}
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center h-64">
          <Loader className="size-6 text-muted-foreground animate-spin" />
        </div>
      )}

      {isError && (
        <div className="flex flex-col gap-y-4 items-center justify-center h-64">
          <TriangleAlert className="size-6 text-muted-foreground" />
          <p className="text-muted-foreground">Falha ao carregar templates</p>
        </div>
      )}

      {filteredTemplates.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredTemplates.map((template: any) => (
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
      )}

      {data && data.length === 0 && !isLoading && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg font-medium mb-2">Nenhum template disponível no momento</p>
          <p className="text-sm">Novos templates serão adicionados em breve!</p>
        </div>
      )}

      {data && data.length > 0 && filteredTemplates.length === 0 && searchTerm && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg font-medium mb-2">Nenhum template encontrado</p>
          <p className="text-sm">Tente buscar com outros termos</p>
        </div>
      )}
      
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
}

