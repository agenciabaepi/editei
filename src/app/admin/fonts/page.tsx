"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Type, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Eye,
  EyeOff,
  Star,
  Crown
} from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface CustomFont {
  id: string;
  name: string;
  family_name: string;
  category: string;
  weights: number[];
  file_url?: string;
  file_format?: string;
  file_size?: number;
  is_active: boolean;
  is_popular: boolean;
  is_pro?: boolean;
  font_files?: Array<{
    id: string;
    file_url: string;
    file_format: string;
    file_size?: number;
    weight: number;
    style: string;
  }>;
  created_at: string;
}

const CATEGORIES = [
  { value: 'sans-serif', label: 'Sans Serif' },
  { value: 'serif', label: 'Serif' },
  { value: 'display', label: 'Display' },
  { value: 'monospace', label: 'Monospace' },
  { value: 'handwriting', label: 'Handwriting' },
  { value: 'other', label: 'Outro' }
];

const WEIGHTS = [100, 200, 300, 400, 500, 600, 700, 800, 900];
const STYLES = ['normal', 'italic'];

export default function FontsPage() {
  const [fonts, setFonts] = useState<CustomFont[]>([]);
  const [filteredFonts, setFilteredFonts] = useState<CustomFont[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [editingFont, setEditingFont] = useState<CustomFont | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [fontUploadForm, setFontUploadForm] = useState({
    name: "",
    familyName: "",
    category: "sans-serif",
    isPopular: false,
    isPro: false,
    fontFiles: [] as Array<{ file: File | null; weight: number; style: string }>,
  });

  const fetchFonts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/fonts");
      if (response.ok) {
        const data = await response.json();
        setFonts(data.fonts);
        setFilteredFonts(data.fonts);
      } else {
        toast.error("Falha ao buscar fontes");
      }
    } catch (error) {
      toast.error("Falha ao buscar fontes");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFonts();
  }, []);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    const filtered = fonts.filter(font => 
      font.name.toLowerCase().includes(term.toLowerCase()) ||
      font.family_name.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredFonts(filtered);
  };

  const handleAddFontFile = () => {
    setFontUploadForm({
      ...fontUploadForm,
      fontFiles: [...fontUploadForm.fontFiles, { file: null, weight: 400, style: 'normal' }]
    });
  };

  const handleRemoveFontFile = (index: number) => {
    setFontUploadForm({
      ...fontUploadForm,
      fontFiles: fontUploadForm.fontFiles.filter((_, i) => i !== index)
    });
  };

  const handleCreateFont = async () => {
    if (!fontUploadForm.name || !fontUploadForm.familyName || fontUploadForm.fontFiles.length === 0) {
      toast.error("Por favor, preencha todos os campos e adicione pelo menos um arquivo de fonte");
      return;
    }

    const missingFiles = fontUploadForm.fontFiles.some(f => !f.file);
    if (missingFiles) {
      toast.error("Por favor, selecione todos os arquivos de fonte");
      return;
    }

    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("name", fontUploadForm.name);
      formData.append("familyName", fontUploadForm.familyName);
      formData.append("category", fontUploadForm.category);
      formData.append("isPopular", fontUploadForm.isPopular.toString());
      formData.append("isPro", fontUploadForm.isPro.toString());

      fontUploadForm.fontFiles.forEach((fontFile, index) => {
        if (fontFile.file) {
          formData.append(`fontFile_${index}`, fontFile.file);
          formData.append(`weight_${index}`, fontFile.weight.toString());
          formData.append(`style_${index}`, fontFile.style);
        }
      });

      const response = await fetch("/api/admin/fonts", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        toast.success("Fonte criada com sucesso");
        setShowAddDialog(false);
        setFontUploadForm({
          name: "",
          familyName: "",
          category: "sans-serif",
          isPopular: false,
          isPro: false,
          fontFiles: [],
        });
        fetchFonts();
      } else {
        const data = await response.json();
        toast.error(data.error || "Falha ao criar fonte");
      }
    } catch (error) {
      toast.error("Falha ao criar fonte");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFont = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta fonte?")) return;

    try {
      const response = await fetch(`/api/admin/fonts/${id}`, {
        method: "DELETE"
      });

      if (response.ok) {
        toast.success("Fonte excluída com sucesso");
        fetchFonts();
      } else {
        toast.error("Falha ao excluir fonte");
      }
    } catch (error) {
      toast.error("Falha ao excluir fonte");
    }
  };

  const toggleActive = async (font: CustomFont) => {
    try {
      const formData = new FormData();
      formData.append("is_active", (!font.is_active).toString());

      const response = await fetch(`/api/admin/fonts/${font.id}`, {
        method: "PUT",
        body: formData
      });

      if (response.ok) {
        toast.success(`Fonte ${!font.is_active ? 'ativada' : 'desativada'}`);
        fetchFonts();
      }
    } catch (error) {
      toast.error("Falha ao atualizar fonte");
    }
  };

  const togglePopular = async (font: CustomFont) => {
    try {
      const formData = new FormData();
      formData.append("is_popular", (!font.is_popular).toString());

      const response = await fetch(`/api/admin/fonts/${font.id}`, {
        method: "PUT",
        body: formData
      });

      if (response.ok) {
        toast.success(`Fonte ${!font.is_popular ? 'marcada como popular' : 'desmarcada como popular'}`);
        fetchFonts();
      }
    } catch (error) {
      toast.error("Falha ao atualizar fonte");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Type className="h-8 w-8 text-blue-500" />
            Fontes
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie fontes personalizadas para o editor
          </p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Fonte
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Adicionar Nova Fonte</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nome da Fonte *</Label>
                <Input
                  value={fontUploadForm.name}
                  onChange={(e) => setFontUploadForm({ ...fontUploadForm, name: e.target.value })}
                  placeholder="Minha Fonte Personalizada"
                />
              </div>
              <div>
                <Label>Nome da Família *</Label>
                <Input
                  value={fontUploadForm.familyName}
                  onChange={(e) => setFontUploadForm({ ...fontUploadForm, familyName: e.target.value })}
                  placeholder="MinhaFonte (sem espaços)"
                />
              </div>
              <div>
                <Label>Categoria *</Label>
                <Select
                  value={fontUploadForm.category}
                  onValueChange={(value) => setFontUploadForm({ ...fontUploadForm, category: value })}
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
                <Label>Arquivos da Fonte *</Label>
                <div className="space-y-2">
                  {fontUploadForm.fontFiles.map((fontFile, index) => (
                    <div key={index} className="flex gap-2 items-end">
                      <div className="flex-1">
                        <Input
                          type="file"
                          accept=".woff,.woff2,.ttf,.otf"
                          onChange={(e) => {
                            const newFiles = [...fontUploadForm.fontFiles];
                            newFiles[index].file = e.target.files?.[0] || null;
                            setFontUploadForm({ ...fontUploadForm, fontFiles: newFiles });
                          }}
                        />
                      </div>
                      <Select
                        value={fontFile.weight.toString()}
                        onValueChange={(value) => {
                          const newFiles = [...fontUploadForm.fontFiles];
                          newFiles[index].weight = parseInt(value);
                          setFontUploadForm({ ...fontUploadForm, fontFiles: newFiles });
                        }}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {WEIGHTS.map(w => (
                            <SelectItem key={w} value={w.toString()}>{w}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={fontFile.style}
                        onValueChange={(value) => {
                          const newFiles = [...fontUploadForm.fontFiles];
                          newFiles[index].style = value;
                          setFontUploadForm({ ...fontUploadForm, fontFiles: newFiles });
                        }}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STYLES.map(s => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFontFile(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddFontFile}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Arquivo de Fonte
                  </Button>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={fontUploadForm.isPopular}
                    onCheckedChange={(checked) => setFontUploadForm({ ...fontUploadForm, isPopular: checked })}
                  />
                  <Label>Popular</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={fontUploadForm.isPro}
                    onCheckedChange={(checked) => setFontUploadForm({ ...fontUploadForm, isPro: checked })}
                  />
                  <Label>Fonte Pro</Label>
                </div>
              </div>
              <Button onClick={handleCreateFont} className="w-full" disabled={isLoading}>
                {isLoading ? "Criando..." : "Criar Fonte"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Todas as Fontes ({filteredFonts.length})</CardTitle>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar fontes..."
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
          ) : filteredFonts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma fonte encontrada
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Família</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Arquivos</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFonts.map((font) => (
                  <TableRow key={font.id}>
                    <TableCell className="font-medium">{font.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {font.family_name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{font.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {font.font_files?.length || 1} arquivo(s)
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {font.is_pro && (
                          <Crown className="h-4 w-4 text-yellow-500" />
                        )}
                        {font.is_popular && (
                          <Star className="h-4 w-4 text-blue-500" />
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleActive(font)}
                        >
                          {font.is_active ? (
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
                          onClick={() => togglePopular(font)}
                        >
                          <Star className={`h-4 w-4 ${font.is_popular ? 'text-blue-500' : ''}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteFont(font.id)}
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
    </div>
  );
}

