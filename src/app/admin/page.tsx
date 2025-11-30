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
  Users, 
  CreditCard, 
  FolderOpen, 
  Upload, 
  Eye,
  Trash2,
  Plus,
  Activity,
  Database,
  TrendingUp,
  UserCheck,
  Type,
  FileText
} from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Template {
  id: string;
  name: string;
  width: number;
  height: number;
  is_pro: boolean;
  thumbnail?: string;
  created_at: string;
}

interface AdminStats {
  totalUsers: number;
  totalSubscriptions: number;
  activeSubscriptions: number;
  totalProjects: number;
  totalTemplates: number;
  proTemplates: number;
  newUsersThisMonth: number;
  revenueThisMonth: number;
  activeUsersToday: number;
}

interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
  created_at: string;
}

interface Subscription {
  id: string;
  user_id: string;
  user_email: string;
  user_name?: string;
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
  status: string;
  stripe_current_period_end?: string;
  created_at: string;
}

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

export default function AdminPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [fonts, setFonts] = useState<CustomFont[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalSubscriptions: 0,
    activeSubscriptions: 0,
    totalProjects: 0,
    totalTemplates: 0,
    proTemplates: 0,
    newUsersThisMonth: 0,
    revenueThisMonth: 0,
    activeUsersToday: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showUsersDialog, setShowUsersDialog] = useState(false);
  const [showSubscriptionsDialog, setShowSubscriptionsDialog] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    name: "",
    json: "",
    width: 900,
    height: 1200,
    is_pro: false,
    thumbnail: null as File | null,
  });
  const [fontUploadForm, setFontUploadForm] = useState({
    name: "",
    familyName: "",
    category: "sans-serif",
    isPopular: false,
    isPro: false,
    fontFiles: [] as Array<{ file: File | null; weight: number; style: string }>,
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadForm({ ...uploadForm, thumbnail: file });
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await fetch("/api/admin/templates");
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates);
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch("/api/admin/subscriptions");
      if (response.ok) {
        const data = await response.json();
        setSubscriptions(data.subscriptions);
      }
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
    }
  };

  const fetchFonts = async () => {
    try {
      const response = await fetch("/api/admin/fonts");
      if (response.ok) {
        const data = await response.json();
        setFonts(data.fonts);
      }
    } catch (error) {
      console.error("Error fetching fonts:", error);
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
        fetchTemplates();
        fetchStats();
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
        fetchStats();
      } else {
        toast.error("Falha ao excluir template");
      }
    } catch (error) {
      toast.error("Falha ao excluir template");
    }
  };

  // Load templates and stats on component mount
  useEffect(() => {
    fetchTemplates();
    fetchStats();
    fetchUsers();
    fetchSubscriptions();
    fetchFonts();
  }, []);

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Painel Administrativo</h2>
          <p className="text-muted-foreground">Gerencie sua aplicação e monitore métricas importantes</p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="fonts">Fontes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics Row 1 */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="p-0 h-auto"
                    onClick={() => setShowUsersDialog(true)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <p className="text-xs text-muted-foreground">
                  Usuários registrados no sistema
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Assinaturas Ativas</CardTitle>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      fetchSubscriptions();
                      setShowSubscriptionsDialog(true);
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
                <p className="text-xs text-muted-foreground">
                  De {stats.totalSubscriptions} assinaturas totais
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Projetos</CardTitle>
                <FolderOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProjects}</div>
                <p className="text-xs text-muted-foreground">
                  Projetos criados por usuários
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Templates</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalTemplates}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.proTemplates} Templates Pro
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Key Metrics Row 2 */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Novos Usuários Este Mês</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.newUsersThisMonth}</div>
                <p className="text-xs text-muted-foreground">
                  +12% em relação ao mês passado
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Receita Este Mês</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R$ {stats.revenueThisMonth}</div>
                <p className="text-xs text-muted-foreground">
                  +8% em relação ao mês passado
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Usuários Ativos Hoje</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeUsersToday}</div>
                <p className="text-xs text-muted-foreground">
                  Usuários ativos nas últimas 24h
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Status do Sistema</CardTitle>
                <Activity className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">Online</div>
                <p className="text-xs text-muted-foreground">
                  Todos os sistemas operacionais
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          {/* Upload Template Section */}
          <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Enviar Novo Template
          </CardTitle>
          <CardDescription>
            Envie um novo arquivo JSON de template para disponibilizá-lo a todos os usuários
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome do Template</Label>
              <Input
                id="name"
                value={uploadForm.name}
                onChange={(e) => setUploadForm({ ...uploadForm, name: e.target.value })}
                placeholder="Digite o nome do template"
              />
            </div>
            <div>
              <Label htmlFor="thumbnail">Imagem Miniatura</Label>
              <Input
                id="thumbnail"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
              />
            </div>
            <div>
              <Label htmlFor="width">Largura</Label>
              <Input
                id="width"
                type="number"
                value={uploadForm.width}
                onChange={(e) => setUploadForm({ ...uploadForm, width: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="height">Altura</Label>
              <Input
                id="height"
                type="number"
                value={uploadForm.height}
                onChange={(e) => setUploadForm({ ...uploadForm, height: parseInt(e.target.value) })}
              />
            </div>
          </div>
          <div>
              <Label htmlFor="json">JSON do Template</Label>
              <Textarea
                id="json"
                value={uploadForm.json}
                onChange={(e) => setUploadForm({ ...uploadForm, json: e.target.value })}
                placeholder="Cole o JSON do template aqui..."
                rows={8}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={uploadForm.is_pro}
                onCheckedChange={(checked: boolean) => setUploadForm({ ...uploadForm, is_pro: checked })}
              />
              <Label htmlFor="is_pro">Template Pro</Label>
            </div>
            <Button onClick={handleUpload} disabled={isLoading}>
              {isLoading ? "Enviando..." : "Enviar Template"}
            </Button>
        </CardContent>
      </Card>

      {/* Templates List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Templates Existentes ({templates.length})
          </CardTitle>
          <CardDescription>
            Gerencie templates existentes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {templates.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Nenhum template encontrado</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <div key={template.id} className="border rounded-lg p-4 space-y-2">
                  {template.thumbnail && (
                    <img
                      src={template.thumbnail}
                      alt={template.name}
                      className="w-full h-32 object-cover rounded"
                    />
                  )}
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{template.name}</h3>
                    {template.is_pro && (
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                        Pro
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {template.width} × {template.height}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Criado: {new Date(template.created_at).toLocaleDateString('pt-BR')}
                  </p>
                  <div className="flex justify-end">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteTemplate(template.id)}
                      className="ml-auto"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="fonts" className="space-y-6">
          {/* Upload Font Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Enviar Nova Fonte
              </CardTitle>
              <CardDescription>
                Faça upload de uma fonte personalizada ou uma família completa (múltiplos arquivos: regular, bold, thin, etc.)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="font-name">Nome da Fonte</Label>
                  <Input
                    id="font-name"
                    value={fontUploadForm.name}
                    onChange={(e) => setFontUploadForm({ ...fontUploadForm, name: e.target.value })}
                    placeholder="Ex: Minha Fonte Personalizada"
                  />
                </div>
                <div>
                  <Label htmlFor="font-family">Nome da Família</Label>
                  <Input
                    id="font-family"
                    value={fontUploadForm.familyName}
                    onChange={(e) => setFontUploadForm({ ...fontUploadForm, familyName: e.target.value })}
                    placeholder="Ex: MinhaFonte"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Nome usado no CSS (sem espaços)
                  </p>
                </div>
                <div>
                  <Label htmlFor="font-category">Categoria</Label>
                  <Select
                    value={fontUploadForm.category}
                    onValueChange={(value) => setFontUploadForm({ ...fontUploadForm, category: value })}
                  >
                    <SelectTrigger id="font-category">
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sans-serif">Sans Serif</SelectItem>
                      <SelectItem value="serif">Serif</SelectItem>
                      <SelectItem value="display">Display</SelectItem>
                      <SelectItem value="handwriting">Handwriting</SelectItem>
                      <SelectItem value="monospace">Monospace</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Font Files Upload Section */}
              <div className="space-y-3 border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Arquivos da Fonte</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFontUploadForm({
                        ...fontUploadForm,
                        fontFiles: [...fontUploadForm.fontFiles, { file: null, weight: 400, style: "normal" }]
                      });
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar Arquivo
                  </Button>
                </div>
                
                {fontUploadForm.fontFiles.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Clique em &quot;Adicionar Arquivo&quot; para começar
                  </p>
                ) : (
                  <div className="space-y-3">
                    {fontUploadForm.fontFiles.map((fontFile, index) => (
                      <div key={index} className="grid grid-cols-12 gap-2 items-end p-3 bg-white rounded border">
                        <div className="col-span-4">
                          <Label className="text-xs">Arquivo</Label>
                          <Input
                            type="file"
                            accept=".woff,.woff2,.ttf,.otf"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const newFiles = [...fontUploadForm.fontFiles];
                                newFiles[index].file = file;
                                setFontUploadForm({ ...fontUploadForm, fontFiles: newFiles });
                              }
                            }}
                            className="text-xs"
                          />
                        </div>
                        <div className="col-span-2">
                          <Label className="text-xs">Peso</Label>
                          <Input
                            type="number"
                            value={fontFile.weight}
                            onChange={(e) => {
                              const newFiles = [...fontUploadForm.fontFiles];
                              newFiles[index].weight = parseInt(e.target.value) || 400;
                              setFontUploadForm({ ...fontUploadForm, fontFiles: newFiles });
                            }}
                            placeholder="400"
                            className="text-xs"
                          />
                        </div>
                        <div className="col-span-2">
                          <Label className="text-xs">Estilo</Label>
                          <Select
                            value={fontFile.style}
                            onValueChange={(value) => {
                              const newFiles = [...fontUploadForm.fontFiles];
                              newFiles[index].style = value;
                              setFontUploadForm({ ...fontUploadForm, fontFiles: newFiles });
                            }}
                          >
                            <SelectTrigger className="text-xs h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="normal">Normal</SelectItem>
                              <SelectItem value="italic">Italic</SelectItem>
                              <SelectItem value="oblique">Oblique</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-3">
                          {fontFile.file && (
                            <p className="text-xs text-muted-foreground truncate">
                              {fontFile.file.name}
                            </p>
                          )}
                        </div>
                        <div className="col-span-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newFiles = fontUploadForm.fontFiles.filter((_, i) => i !== index);
                              setFontUploadForm({ ...fontUploadForm, fontFiles: newFiles });
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  💡 Dica: Adicione múltiplos arquivos para criar uma família completa (ex: Regular 400, Bold 700, Thin 100)
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={fontUploadForm.isPopular}
                    onCheckedChange={(checked: boolean) => setFontUploadForm({ ...fontUploadForm, isPopular: checked })}
                  />
                  <Label>Marcar como Popular</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={fontUploadForm.isPro}
                    onCheckedChange={(checked: boolean) => setFontUploadForm({ ...fontUploadForm, isPro: checked })}
                  />
                  <Label>
                    Fonte PRO <span className="text-xs text-muted-foreground">(apenas para usuários com assinatura Pro)</span>
                  </Label>
                </div>
              </div>

              <Button 
                onClick={async () => {
                  if (!fontUploadForm.name || !fontUploadForm.familyName || fontUploadForm.fontFiles.length === 0) {
                    toast.error("Por favor, preencha todos os campos e adicione pelo menos um arquivo");
                    return;
                  }

                  // Validate all files are selected
                  const missingFiles = fontUploadForm.fontFiles.some(f => !f.file);
                  if (missingFiles) {
                    toast.error("Por favor, selecione todos os arquivos");
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

                    // Add all font files
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
                      toast.success("Fonte enviada com sucesso!");
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
                      const error = await response.json();
                      toast.error(error.error || "Falha ao enviar fonte");
                    }
                  } catch (error) {
                    toast.error("Falha ao enviar fonte");
                  } finally {
                    setIsLoading(false);
                  }
                }}
                disabled={isLoading}
              >
                {isLoading ? "Enviando..." : "Enviar Fonte"}
              </Button>
            </CardContent>
          </Card>

          {/* Fonts List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="h-5 w-5" />
                Fontes Personalizadas ({fonts.length})
              </CardTitle>
              <CardDescription>
                Gerencie fontes personalizadas enviadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {fonts.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Nenhuma fonte encontrada</p>
              ) : (
                <div className="space-y-4">
                  {fonts.map((font) => (
                    <div key={font.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium text-lg" style={{ fontFamily: font.family_name }}>
                              {font.name}
                            </h3>
                            {font.is_popular && (
                              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                                Popular
                              </span>
                            )}
                            {font.is_pro && (
                              <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                                PRO
                              </span>
                            )}
                            {!font.is_active && (
                              <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                                Inativa
                              </span>
                            )}
                          </div>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <p><strong>Família:</strong> {font.family_name}</p>
                            <p><strong>Categoria:</strong> {font.category}</p>
                            {font.font_files && Array.isArray(font.font_files) && font.font_files.length > 0 ? (
                              <div>
                                <p><strong>Arquivos:</strong> {font.font_files.length} arquivo(s)</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {font.font_files.map((file: any, idx: number) => (
                                    <span key={idx} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                                      {file.weight} {file.style}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <p><strong>Formato:</strong> {font.file_format?.toUpperCase() || 'N/A'}</p>
                            )}
                            {font.file_size && (
                              <p><strong>Tamanho:</strong> {(font.file_size / 1024).toFixed(2)} KB</p>
                            )}
                            <p><strong>Criada em:</strong> {new Date(font.created_at).toLocaleDateString('pt-BR')}</p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={font.is_active}
                              onCheckedChange={async (checked) => {
                                try {
                                  const response = await fetch(`/api/admin/fonts/${font.id}`, {
                                    method: "PATCH",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ is_active: checked }),
                                  });
                                  if (response.ok) {
                                    toast.success(checked ? "Fonte ativada" : "Fonte desativada");
                                    fetchFonts();
                                  }
                                } catch (error) {
                                  toast.error("Falha ao atualizar fonte");
                                }
                              }}
                            />
                            <Label className="text-xs">Ativa</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={font.is_popular}
                              onCheckedChange={async (checked) => {
                                try {
                                  const response = await fetch(`/api/admin/fonts/${font.id}`, {
                                    method: "PATCH",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ is_popular: checked }),
                                  });
                                  if (response.ok) {
                                    toast.success(checked ? "Marcada como popular" : "Removida dos populares");
                                    fetchFonts();
                                  }
                                } catch (error) {
                                  toast.error("Falha ao atualizar fonte");
                                }
                              }}
                            />
                            <Label className="text-xs">Popular</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={font.is_pro || false}
                              onCheckedChange={async (checked) => {
                                try {
                                  const response = await fetch(`/api/admin/fonts/${font.id}`, {
                                    method: "PATCH",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ is_pro: checked }),
                                  });
                                  if (response.ok) {
                                    toast.success(checked ? "Marcada como PRO" : "Removida do PRO");
                                    fetchFonts();
                                  }
                                } catch (error) {
                                  toast.error("Falha ao atualizar fonte");
                                }
                              }}
                            />
                            <Label className="text-xs">PRO</Label>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={async () => {
                              if (!confirm("Tem certeza que deseja excluir esta fonte?")) return;
                              try {
                                const response = await fetch(`/api/admin/fonts/${font.id}`, {
                                  method: "DELETE",
                                });
                                if (response.ok) {
                                  toast.success("Fonte excluída com sucesso!");
                                  fetchFonts();
                                } else {
                                  toast.error("Falha ao excluir fonte");
                                }
                              } catch (error) {
                                toast.error("Falha ao excluir fonte");
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Users Dialog */}
      <Dialog open={showUsersDialog} onOpenChange={setShowUsersDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Lista de Usuários ({stats.totalUsers} total)</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{user.name || "Sem nome"}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role === 'admin' ? 'Administrador' : 'Usuário'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Entrou em: {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Subscriptions Dialog */}
      <Dialog open={showSubscriptionsDialog} onOpenChange={setShowSubscriptionsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Lista de Assinaturas ({stats.totalSubscriptions} total)</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {subscriptions.map((subscription) => (
                <div key={subscription.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{subscription.user_name || "Sem nome"}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        subscription.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : subscription.status === 'canceled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {subscription.status === 'active' ? 'Ativa' : subscription.status === 'canceled' ? 'Cancelada' : subscription.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{subscription.user_email}</p>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>Iniciada em: {new Date(subscription.created_at).toLocaleDateString('pt-BR')}</span>
                      {subscription.stripe_current_period_end && (
                        <span>Expira em: {new Date(subscription.stripe_current_period_end).toLocaleDateString('pt-BR')}</span>
                      )}
                    </div>
                    {subscription.stripe_subscription_id && (
                      <p className="text-xs text-muted-foreground font-mono">
                        ID: {subscription.stripe_subscription_id}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
