"use client";

import { useState, useEffect, useCallback } from "react";
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
  Shapes, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Eye,
  EyeOff,
  Crown
} from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface Element {
  id: string;
  name: string;
  description: string | null;
  category: string;
  file_url: string;
  thumbnail_url: string | null;
  width: number | null;
  height: number | null;
  file_type: string;
  tags: string[];
  is_pro: boolean;
  is_active: boolean;
  created_at: string;
}

const CATEGORIES = [
  { value: 'png', label: 'PNG' },
  { value: '3d', label: 'Modelo 3D' },
  { value: 'icon', label: 'Ícone' },
  { value: 'illustration', label: 'Ilustração' },
  { value: 'shape', label: 'Forma' },
  { value: 'sticker', label: 'Adesivo' },
  { value: 'other', label: 'Outro' }
];

const FILE_TYPES = [
  { value: 'image/png', label: 'Imagem PNG' },
  { value: 'image/jpeg', label: 'Imagem JPEG' },
  { value: 'image/svg+xml', label: 'SVG' },
  { value: 'model/glb', label: 'Modelo 3D GLB' },
  { value: 'model/gltf', label: 'Modelo 3D GLTF' },
  { value: 'other', label: 'Outro' }
];

export default function ElementsPage() {
  const [elements, setElements] = useState<Element[]>([]);
  const [filteredElements, setFilteredElements] = useState<Element[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);
  const [editingElement, setEditingElement] = useState<Element | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newElement, setNewElement] = useState({
    name: "",
    description: "",
    category: "png",
    file_type: "image/png",
    is_pro: false,
    is_active: true,
    tags: "",
    width: "",
    height: ""
  });
  const [elementFile, setElementFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  const fetchElements = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/elements");
      if (response.ok) {
        const data = await response.json();
        setElements(data.elements);
        setFilteredElements(data.elements);
      } else {
        toast.error("Falha ao buscar elementos");
      }
    } catch (error) {
      toast.error("Falha ao buscar elementos");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchElements();
  }, []);

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    let filtered = elements;

    if (term) {
      filtered = filtered.filter(element => 
        element.name.toLowerCase().includes(term.toLowerCase()) ||
        (element.description && element.description.toLowerCase().includes(term.toLowerCase()))
      );
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(element => element.category === categoryFilter);
    }

    setFilteredElements(filtered);
  }, [elements, categoryFilter]);

  useEffect(() => {
    handleSearch(searchTerm);
  }, [categoryFilter, elements, handleSearch, searchTerm]);

  const handleCreateElement = async () => {
    if (!newElement.name || !elementFile) {
      toast.error("Nome e arquivo são obrigatórios");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", newElement.name);
      formData.append("description", newElement.description);
      formData.append("category", newElement.category);
      formData.append("file_type", newElement.file_type);
      formData.append("is_pro", newElement.is_pro.toString());
      formData.append("is_active", newElement.is_active.toString());
      formData.append("tags", newElement.tags);
      if (newElement.width) formData.append("width", newElement.width);
      if (newElement.height) formData.append("height", newElement.height);
      if (elementFile) formData.append("file", elementFile);
      if (thumbnailFile) formData.append("thumbnail", thumbnailFile);

      const response = await fetch("/api/admin/elements", {
        method: "POST",
        body: formData
      });

      if (response.ok) {
        toast.success("Elemento criado com sucesso");
        setShowAddDialog(false);
        setNewElement({
          name: "",
          description: "",
          category: "png",
          file_type: "image/png",
          is_pro: false,
          is_active: true,
          tags: "",
          width: "",
          height: ""
        });
        setElementFile(null);
        setThumbnailFile(null);
        fetchElements();
      } else {
        const data = await response.json();
        toast.error(data.error || "Falha ao criar elemento");
      }
    } catch (error) {
      toast.error("Falha ao criar elemento");
    }
  };

  const handleUpdateElement = async () => {
    if (!editingElement) return;

    try {
      const formData = new FormData();
      formData.append("name", editingElement.name);
      formData.append("description", editingElement.description || "");
      formData.append("category", editingElement.category);
      formData.append("file_type", editingElement.file_type);
      formData.append("is_pro", editingElement.is_pro.toString());
      formData.append("is_active", editingElement.is_active.toString());
      formData.append("tags", editingElement.tags.join(", "));
      if (editingElement.width) formData.append("width", editingElement.width.toString());
      if (editingElement.height) formData.append("height", editingElement.height.toString());

      const response = await fetch(`/api/admin/elements/${editingElement.id}`, {
        method: "PUT",
        body: formData
      });

      if (response.ok) {
        toast.success("Elemento atualizado com sucesso");
        setEditingElement(null);
        fetchElements();
      } else {
        const data = await response.json();
        toast.error(data.error || "Falha ao atualizar elemento");
      }
    } catch (error) {
      toast.error("Falha ao atualizar elemento");
    }
  };

  const handleDeleteElement = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este elemento?")) return;

    try {
      const response = await fetch(`/api/admin/elements/${id}`, {
        method: "DELETE"
      });

      if (response.ok) {
        toast.success("Elemento excluído com sucesso");
        fetchElements();
      } else {
        toast.error("Falha ao excluir elemento");
      }
    } catch (error) {
      toast.error("Falha ao excluir elemento");
    }
  };

  const toggleActive = async (element: Element) => {
    try {
      const formData = new FormData();
      formData.append("is_active", (!element.is_active).toString());

      const response = await fetch(`/api/admin/elements/${element.id}`, {
        method: "PUT",
        body: formData
      });

      if (response.ok) {
        toast.success(`Elemento ${!element.is_active ? 'ativado' : 'desativado'}`);
        fetchElements();
      }
    } catch (error) {
      toast.error("Falha ao atualizar elemento");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shapes className="h-8 w-8 text-green-500" />
            Elementos
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie elementos de design (PNG, modelos 3D, ícones, etc.)
          </p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Elemento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Elemento</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nome *</Label>
                <Input
                  value={newElement.name}
                  onChange={(e) => setNewElement({ ...newElement, name: e.target.value })}
                  placeholder="Nome do elemento"
                />
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea
                  value={newElement.description}
                  onChange={(e) => setNewElement({ ...newElement, description: e.target.value })}
                  placeholder="Descrição do elemento"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Categoria *</Label>
                  <Select
                    value={newElement.category}
                    onValueChange={(value) => setNewElement({ ...newElement, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Tipo de Arquivo *</Label>
                  <Select
                    value={newElement.file_type}
                    onValueChange={(value) => setNewElement({ ...newElement, file_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FILE_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Largura (px)</Label>
                  <Input
                    type="number"
                    value={newElement.width}
                    onChange={(e) => setNewElement({ ...newElement, width: e.target.value })}
                    placeholder="Opcional"
                  />
                </div>
                <div>
                  <Label>Altura (px)</Label>
                  <Input
                    type="number"
                    value={newElement.height}
                    onChange={(e) => setNewElement({ ...newElement, height: e.target.value })}
                    placeholder="Opcional"
                  />
                </div>
              </div>
              <div>
                <Label>Tags (separadas por vírgula)</Label>
                <Input
                  value={newElement.tags}
                  onChange={(e) => setNewElement({ ...newElement, tags: e.target.value })}
                  placeholder="tag1, tag2, tag3"
                />
              </div>
              <div>
                <Label>Arquivo do Elemento *</Label>
                <Input
                  type="file"
                  onChange={(e) => setElementFile(e.target.files?.[0] || null)}
                  accept="image/*,model/glb,model/gltf"
                />
              </div>
              <div>
                <Label>Miniatura (opcional)</Label>
                <Input
                  type="file"
                  onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                  accept="image/*"
                />
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={newElement.is_pro}
                    onCheckedChange={(checked) => setNewElement({ ...newElement, is_pro: checked })}
                  />
                  <Label>Elemento Pro</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={newElement.is_active}
                    onCheckedChange={(checked) => setNewElement({ ...newElement, is_active: checked })}
                  />
                  <Label>Ativo</Label>
                </div>
              </div>
              <Button onClick={handleCreateElement} className="w-full">
                Criar Elemento
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Todos os Elementos ({filteredElements.length})</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar elementos..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Categorias</SelectItem>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : filteredElements.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum elemento encontrado
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredElements.map((element) => (
                  <TableRow key={element.id}>
                    <TableCell className="font-medium">{element.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{element.category}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {element.file_type}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {element.tags.slice(0, 3).map((tag, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {element.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{element.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {element.is_pro && (
                          <Crown className="h-4 w-4 text-yellow-500" />
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleActive(element)}
                        >
                          {element.is_active ? (
                            <Eye className="h-4 w-4 text-green-500" />
                          ) : (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingElement(element)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteElement(element.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {editingElement && (
        <Dialog open={!!editingElement} onOpenChange={() => setEditingElement(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Elemento</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nome *</Label>
                <Input
                  value={editingElement.name}
                  onChange={(e) => setEditingElement({ ...editingElement, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea
                  value={editingElement.description || ""}
                  onChange={(e) => setEditingElement({ ...editingElement, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Categoria *</Label>
                  <Select
                    value={editingElement.category}
                    onValueChange={(value) => setEditingElement({ ...editingElement, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Tipo de Arquivo *</Label>
                  <Select
                    value={editingElement.file_type}
                    onValueChange={(value) => setEditingElement({ ...editingElement, file_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FILE_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Tags (separadas por vírgula)</Label>
                <Input
                  value={editingElement.tags.join(", ")}
                  onChange={(e) => setEditingElement({ 
                    ...editingElement, 
                    tags: e.target.value.split(",").map(t => t.trim()).filter(t => t)
                  })}
                />
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={editingElement.is_pro}
                    onCheckedChange={(checked) => setEditingElement({ ...editingElement, is_pro: checked })}
                  />
                  <Label>Elemento Pro</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={editingElement.is_active}
                    onCheckedChange={(checked) => setEditingElement({ ...editingElement, is_active: checked })}
                  />
                  <Label>Ativo</Label>
                </div>
              </div>
              <Button onClick={handleUpdateElement} className="w-full">
                Atualizar Elemento
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

