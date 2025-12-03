"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Crown,
  Image as ImageIcon
} from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

interface Template {
  id: string;
  name: string;
  width: number;
  height: number;
  is_pro: boolean;
  thumbnail?: string;
  created_at: string;
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    name: "",
    json: "",
    width: 900,
    height: 1200,
    is_pro: false,
    thumbnail: null as File | null,
  });

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/templates");
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates);
        setFilteredTemplates(data.templates);
      } else {
        toast.error("Failed to fetch templates");
      }
    } catch (error) {
      toast.error("Failed to fetch templates");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    const filtered = templates.filter(template => 
      template.name.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredTemplates(filtered);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadForm({ ...uploadForm, thumbnail: file });
    }
  };

  const handleUpload = async () => {
    if (!uploadForm.name || !uploadForm.json || !uploadForm.thumbnail) {
      toast.error("Por favor, preencha todos os campos e selecione uma miniatura");
      return;
    }

    try {
      setIsLoading(true);
      
      const formData = new FormData();
      formData.append("name", uploadForm.name);
      formData.append("json", uploadForm.json);
      formData.append("width", uploadForm.width.toString());
      formData.append("height", uploadForm.height.toString());
      formData.append("is_pro", uploadForm.is_pro.toString());
      formData.append("thumbnail", uploadForm.thumbnail);

      const response = await fetch("/api/admin/templates", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        toast.success("Template enviado com sucesso!");
        setUploadForm({
          name: "",
          json: "",
          width: 900,
          height: 1200,
          is_pro: false,
          thumbnail: null,
        });
        setShowAddDialog(false);
        fetchTemplates();
      } else {
        const error = await response.json();
        toast.error(error.error || "Falha ao enviar template");
      }
    } catch (error) {
      toast.error("Falha ao enviar template");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTemplate = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este template?")) return;
    
    try {
      const response = await fetch(`/api/admin/templates/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Template excluído com sucesso!");
        fetchTemplates();
      } else {
        toast.error("Falha ao excluir template");
      }
    } catch (error) {
      toast.error("Falha ao excluir template");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="h-8 w-8 text-orange-500" />
            Templates
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie templates de design para os usuários
          </p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Template</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nome do Template *</Label>
                <Input
                  value={uploadForm.name}
                  onChange={(e) => setUploadForm({ ...uploadForm, name: e.target.value })}
                  placeholder="Nome do template"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Largura *</Label>
                  <Input
                    type="number"
                    value={uploadForm.width}
                    onChange={(e) => setUploadForm({ ...uploadForm, width: parseInt(e.target.value) || 900 })}
                  />
                </div>
                <div>
                  <Label>Altura *</Label>
                  <Input
                    type="number"
                    value={uploadForm.height}
                    onChange={(e) => setUploadForm({ ...uploadForm, height: parseInt(e.target.value) || 1200 })}
                  />
                </div>
              </div>
              <div>
                <Label>JSON do Canvas *</Label>
                <Textarea
                  value={uploadForm.json}
                  onChange={(e) => setUploadForm({ ...uploadForm, json: e.target.value })}
                  placeholder='{"objects": [], "background": "white"}'
                  className="font-mono text-xs"
                  rows={10}
                />
              </div>
              <div>
                <Label>Miniatura *</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={uploadForm.is_pro}
                  onCheckedChange={(checked) => setUploadForm({ ...uploadForm, is_pro: checked })}
                />
                <Label>Template Pro</Label>
              </div>
              <Button onClick={handleUpload} className="w-full" disabled={isLoading}>
                {isLoading ? "Enviando..." : "Enviar Template"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Todos os Templates ({filteredTemplates.length})</CardTitle>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar templates..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-8 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum template encontrado
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Miniatura</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Dimensões</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTemplates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell>
                      {template.thumbnail ? (
                        <img
                          src={template.thumbnail}
                          alt={template.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                          <ImageIcon className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{template.name}</TableCell>
                    <TableCell>
                      {template.width} × {template.height}
                    </TableCell>
                    <TableCell>
                      {template.is_pro && (
                        <Badge variant="outline" className="flex items-center gap-1 w-fit">
                          <Crown className="h-3 w-3" />
                          Pro
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteTemplate(template.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

