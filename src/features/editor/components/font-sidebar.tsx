import { 
  ActiveTool, 
  Editor, 
  FONT_SIZE, 
  FONT_WEIGHT 
} from "@/features/editor/types";
import { ToolSidebarClose } from "@/features/editor/components/tool-sidebar-close";
import { ToolSidebarHeader } from "@/features/editor/components/tool-sidebar-header";
import { fontLoader, ensureFontLoaded, PROFESSIONAL_FONTS, FontDefinition } from "@/features/editor/utils/font-loader";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Star, Loader2, Crown, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { usePaywall } from "@/features/subscriptions/hooks/use-paywall";
import { toast } from "sonner";

interface FontSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
};


export const FontSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: FontSidebarProps) => {
  const value = editor?.getActiveFontFamily();
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingFonts, setLoadingFonts] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState("popular");
  const [allFonts, setAllFonts] = useState<FontDefinition[]>(PROFESSIONAL_FONTS);
  const [customFonts, setCustomFonts] = useState<Map<string, boolean>>(new Map()); // Map of font name to is_pro
  const { shouldBlock, triggerPaywall } = usePaywall();

  // Load custom fonts info and track PRO status
  useEffect(() => {
    const loadCustomFontsInfo = async () => {
      try {
        const response = await fetch('/api/fonts');
        if (response.ok) {
          const data = await response.json();
          const customFontsData = data.fonts || [];
          const proFontsMap = new Map<string, boolean>();
          const newFonts: FontDefinition[] = [];
          
          customFontsData.forEach((font: any) => {
            if (!font.is_active) return;
            
            console.log('[Font Sidebar] Loading custom font:', font.family_name, { is_pro: font.is_pro });
            
            // Extract weights from font_files if available
            let weights: number[] = font.weights || [400];
            if (font.font_files && Array.isArray(font.font_files) && font.font_files.length > 0) {
              weights = font.font_files.map((f: any) => f.weight || 400);
              weights = Array.from(new Set(weights)).sort((a: number, b: number) => a - b);
            }
            
            // Create FontDefinition for custom font
            const fontDef: FontDefinition = {
              name: font.family_name,
              category: font.category as FontDefinition['category'],
              weights: weights,
              fallback: `${font.family_name}, Arial, sans-serif`,
              googleFont: false,
              popular: font.is_popular || false,
            };
            
            newFonts.push(fontDef);
            
            // Track PRO fonts
            if (font.is_pro) {
              proFontsMap.set(font.family_name, true);
            }
          });
          
          console.log('[Font Sidebar] Loaded custom fonts:', newFonts.length, 'PRO fonts:', proFontsMap.size);
          
          setCustomFonts(proFontsMap);
          
          // Add custom fonts to the list (combine with professional fonts)
          const combinedFonts = [...PROFESSIONAL_FONTS, ...newFonts];
          console.log('[Font Sidebar] Total fonts:', combinedFonts.length);
          setAllFonts(combinedFonts);
          
          // Also add to fontLoader cache if available
          if (fontLoader && newFonts.length > 0) {
            newFonts.forEach(font => {
              (fontLoader as any).fontCache.set(font.name, font);
            });
          }
        }
      } catch (error) {
        console.error('Failed to load custom fonts info:', error);
      }
    };
    
    loadCustomFontsInfo();
    
    // Refresh fonts list periodically to catch new uploads
    const refreshFonts = async () => {
      // Force reload custom fonts from API
      if (fontLoader && (fontLoader as any).reloadCustomFonts) {
        try {
          await (fontLoader as any).reloadCustomFonts();
        } catch (e) {
          console.error('Failed to refresh custom fonts:', e);
        }
      }
      // Also reload from our direct API call
      await loadCustomFontsInfo();
    };
    
    // Initial load
    loadCustomFontsInfo();
    
    // Initial refresh after a short delay to let fontLoader initialize
    const timeout = setTimeout(() => {
      refreshFonts();
    }, 1000);
    
    // Refresh every 10 seconds to catch new uploads
    const interval = setInterval(() => {
      refreshFonts();
    }, 10000);
    
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [shouldBlock]);

  const onClose = () => {
    onChangeActiveTool("select");
  };

  const handleFontChange = async (fontName: string) => {
    // Check if font is PRO and user doesn't have subscription
    if (customFonts.get(fontName) && shouldBlock) {
      toast.error("Esta fonte é exclusiva para usuários PRO. Faça upgrade para usar!");
      triggerPaywall();
      return;
    }
    
    setLoadingFonts(prev => new Set(prev).add(fontName));
    
    try {
      await ensureFontLoaded(fontName);
      editor?.changeFontFamily(fontName);
    } catch (error) {
      console.error(`Failed to load font ${fontName}:`, error);
      // Still try to apply the font with fallback
      editor?.changeFontFamily(fontName);
    } finally {
      setLoadingFonts(prev => {
        const newSet = new Set(prev);
        newSet.delete(fontName);
        return newSet;
      });
    }
  };

  const FontButton = ({ font }: { font: FontDefinition }) => {
    const isLoading = loadingFonts.has(font.name);
    const isSelected = value === font.name;
    const isProFont = customFonts.get(font.name);
    const isBlocked = isProFont && shouldBlock;
    
    return (
      <Button
        key={font.name}
        variant="ghost"
        disabled={isLoading}
        className={cn(
          "w-full h-16 justify-start text-left p-3 hover:bg-gray-50 transition-all duration-200",
          isSelected && "bg-blue-50 border-2 border-blue-500 shadow-sm",
          isLoading && "opacity-50",
          isBlocked && "opacity-60"
        )}
        onClick={() => handleFontChange(font.name)}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex flex-col items-start flex-1">
            <div className="flex items-center gap-2">
              <div
                className="font-medium text-base leading-tight"
                style={{ 
                  fontFamily: fontLoader?.getFontFallback(font.name) || font.name,
                  fontWeight: font.weights.includes(500) ? 500 : 400
                }}
              >
                {font.name}
              </div>
              {font.popular && (
                <Star className="w-3 h-3 text-yellow-500 fill-current" />
              )}
              {customFonts.get(font.name) && (
                <Crown className="w-3 h-3 text-purple-500 fill-current" />
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge 
                variant="secondary" 
                className={cn(
                  "text-xs capitalize",
                  font.category === 'serif' && "bg-amber-100 text-amber-800",
                  font.category === 'sans-serif' && "bg-blue-100 text-blue-800",
                  font.category === 'display' && "bg-purple-100 text-purple-800",
                  font.category === 'handwriting' && "bg-pink-100 text-pink-800",
                  font.category === 'monospace' && "bg-green-100 text-green-800",
                  font.category === 'system' && "bg-gray-100 text-gray-800"
                )}
              >
                {font.category.replace('-', ' ')}
              </Badge>
              {font.googleFont && (
                <Badge variant="outline" className="text-xs">
                  Google
                </Badge>
              )}
              {customFonts.get(font.name) && (
                <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                  <Crown className="w-3 h-3 mr-1" />
                  PRO
                </Badge>
              )}
            </div>
          </div>
          {isLoading && (
            <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
          )}
        </div>
      </Button>
    );
  };

  // Filter fonts based on search and category
  const getFilteredFonts = (category?: string) => {
    let fonts = allFonts;
    
    if (category === 'popular') {
      fonts = fontLoader?.getPopularFonts() || allFonts.filter(f => f.popular);
    } else if (category && category !== 'all') {
      fonts = fontLoader?.getFontsByCategory(category as FontDefinition['category']) || allFonts.filter(f => f.category === category);
    }
    
    // Filter out PRO fonts if user doesn't have subscription
    // But show them with a disabled state so user knows they exist
    // Actually, let's show them but block usage - better UX
    // if (shouldBlock) {
    //   fonts = fonts.filter(font => !customFonts.get(font.name));
    // }
    
    if (searchTerm) {
      fonts = fonts.filter(font => 
        font.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        font.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return fonts;
  };

  return (
    <aside
      className={cn(
        "bg-white relative border-r z-[40] w-[360px] h-full flex flex-col",
        activeTool === "font" ? "visible" : "hidden",
      )}
    >
      <ToolSidebarHeader
        title="Fontes Profissionais"
        description="Escolha da nossa coleção curada de fontes"
      />
      
      {/* Search Bar */}
      <div className="p-4 border-b space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar fontes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-9"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={async () => {
            // Force reload
            if (fontLoader && (fontLoader as any).reloadCustomFonts) {
              await (fontLoader as any).reloadCustomFonts();
            }
            // Reload from API
            const response = await fetch('/api/fonts');
            if (response.ok) {
              const data = await response.json();
              const customFontsData = data.fonts || [];
              const proFontsMap = new Map<string, boolean>();
              const newFonts: FontDefinition[] = [];
              
              customFontsData.forEach((font: any) => {
                if (!font.is_active) return;
                
                let weights = font.weights || [400];
                if (font.font_files && Array.isArray(font.font_files) && font.font_files.length > 0) {
                  weights = font.font_files.map((f: any) => f.weight || 400);
                  weights = [...new Set(weights)].sort((a, b) => a - b);
                }
                
                const fontDef: FontDefinition = {
                  name: font.family_name,
                  category: font.category as FontDefinition['category'],
                  weights: weights,
                  fallback: `${font.family_name}, Arial, sans-serif`,
                  googleFont: false,
                  popular: font.is_popular || false,
                };
                
                newFonts.push(fontDef);
                
                if (font.is_pro) {
                  proFontsMap.set(font.family_name, true);
                }
              });
              
              setCustomFonts(proFontsMap);
              const combinedFonts = [...PROFESSIONAL_FONTS, ...newFonts];
              setAllFonts(combinedFonts);
              
              if (fontLoader && newFonts.length > 0) {
                newFonts.forEach(font => {
                  (fontLoader as any).fontCache.set(font.name, font);
                });
              }
              
              toast.success("Fontes atualizadas!");
            }
          }}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar Fontes
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="popular" className="text-xs">
                <Star className="w-3 h-3 mr-1" />
                Populares
              </TabsTrigger>
              <TabsTrigger value="sans-serif" className="text-xs">Sans Serif</TabsTrigger>
              <TabsTrigger value="serif" className="text-xs">Serif</TabsTrigger>
            </TabsList>
            
            <div className="mb-2">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="display" className="text-xs">Display</TabsTrigger>
                <TabsTrigger value="handwriting" className="text-xs">Script</TabsTrigger>
                <TabsTrigger value="monospace" className="text-xs">Mono</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="popular" className="space-y-2 mt-4">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  Fontes Populares
                </h3>
                {getFilteredFonts('popular').length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Nenhuma fonte popular encontrada</p>
                ) : (
                  getFilteredFonts('popular').map((font) => (
                    <FontButton key={font.name} font={font} />
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="sans-serif" className="space-y-2 mt-4">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Fontes Sans Serif</h3>
                {getFilteredFonts('sans-serif').length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Nenhuma fonte encontrada</p>
                ) : (
                  getFilteredFonts('sans-serif').map((font) => (
                    <FontButton key={font.name} font={font} />
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="serif" className="space-y-2 mt-4">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Fontes Serif</h3>
                {getFilteredFonts('serif').length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Nenhuma fonte encontrada</p>
                ) : (
                  getFilteredFonts('serif').map((font) => (
                    <FontButton key={font.name} font={font} />
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="display" className="space-y-2 mt-4">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Fontes Display</h3>
                {getFilteredFonts('display').length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Nenhuma fonte encontrada</p>
                ) : (
                  getFilteredFonts('display').map((font) => (
                    <FontButton key={font.name} font={font} />
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="handwriting" className="space-y-2 mt-4">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Handwriting & Script</h3>
                {getFilteredFonts('handwriting').length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Nenhuma fonte encontrada</p>
                ) : (
                  getFilteredFonts('handwriting').map((font) => (
                    <FontButton key={font.name} font={font} />
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="monospace" className="space-y-2 mt-4">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Fontes Monospace</h3>
                {getFilteredFonts('monospace').length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Nenhuma fonte encontrada</p>
                ) : (
                  getFilteredFonts('monospace').map((font) => (
                    <FontButton key={font.name} font={font} />
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
