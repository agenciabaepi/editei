/**
 * Professional Font Loading System
 * Handles Google Fonts loading with fallbacks and caching
 */

export interface FontDefinition {
  name: string;
  category: 'serif' | 'sans-serif' | 'display' | 'handwriting' | 'monospace' | 'system';
  weights: number[];
  fallback: string;
  googleFont?: boolean;
  preload?: boolean;
  popular?: boolean;
}

export const PROFESSIONAL_FONTS: FontDefinition[] = [
  // System Fonts (Always Available)
  { name: 'Arial', category: 'sans-serif', weights: [400, 700], fallback: 'Arial, sans-serif', popular: true },
  { name: 'Helvetica', category: 'sans-serif', weights: [400, 700], fallback: 'Helvetica, Arial, sans-serif', popular: true },
  { name: 'Times New Roman', category: 'serif', weights: [400, 700], fallback: 'Times New Roman, Times, serif' },
  { name: 'Georgia', category: 'serif', weights: [400, 700], fallback: 'Georgia, serif', popular: true },
  { name: 'Courier New', category: 'monospace', weights: [400, 700], fallback: 'Courier New, Courier, monospace' },
  { name: 'Verdana', category: 'sans-serif', weights: [400, 700], fallback: 'Verdana, Geneva, sans-serif' },
  { name: 'Tahoma', category: 'sans-serif', weights: [400, 700], fallback: 'Tahoma, Geneva, sans-serif' },
  { name: 'Impact', category: 'display', weights: [400], fallback: 'Impact, Arial Black, sans-serif' },

  // Professional Google Fonts - Sans Serif
  { name: 'Inter', category: 'sans-serif', weights: [300, 400, 500, 600, 700], fallback: 'Inter, system-ui, sans-serif', googleFont: true, preload: true, popular: true },
  { name: 'Roboto', category: 'sans-serif', weights: [300, 400, 500, 700], fallback: 'Roboto, Arial, sans-serif', googleFont: true, preload: true, popular: true },
  { name: 'Open Sans', category: 'sans-serif', weights: [300, 400, 600, 700], fallback: 'Open Sans, Arial, sans-serif', googleFont: true, preload: true, popular: true },
  { name: 'Lato', category: 'sans-serif', weights: [300, 400, 700], fallback: 'Lato, Arial, sans-serif', googleFont: true, popular: true },
  { name: 'Montserrat', category: 'sans-serif', weights: [300, 400, 500, 600, 700, 800], fallback: 'Montserrat, Arial, sans-serif', googleFont: true, popular: true },
  { name: 'Source Sans Pro', category: 'sans-serif', weights: [300, 400, 600, 700], fallback: 'Source Sans Pro, Arial, sans-serif', googleFont: true },
  { name: 'Raleway', category: 'sans-serif', weights: [300, 400, 500, 600, 700], fallback: 'Raleway, Arial, sans-serif', googleFont: true },
  { name: 'Nunito', category: 'sans-serif', weights: [300, 400, 600, 700], fallback: 'Nunito, Arial, sans-serif', googleFont: true },
  { name: 'Poppins', category: 'sans-serif', weights: [300, 400, 500, 600, 700], fallback: 'Poppins, Arial, sans-serif', googleFont: true, popular: true },
  { name: 'Work Sans', category: 'sans-serif', weights: [300, 400, 500, 600, 700], fallback: 'Work Sans, Arial, sans-serif', googleFont: true },

  // Professional Google Fonts - Serif
  { name: 'Merriweather', category: 'serif', weights: [300, 400, 700], fallback: 'Merriweather, Georgia, serif', googleFont: true, popular: true },
  { name: 'Playfair Display', category: 'serif', weights: [400, 500, 600, 700], fallback: 'Playfair Display, Georgia, serif', googleFont: true, popular: true },
  { name: 'Lora', category: 'serif', weights: [400, 500, 600, 700], fallback: 'Lora, Georgia, serif', googleFont: true },
  { name: 'PT Serif', category: 'serif', weights: [400, 700], fallback: 'PT Serif, Georgia, serif', googleFont: true },
  { name: 'Crimson Text', category: 'serif', weights: [400, 600, 700], fallback: 'Crimson Text, Georgia, serif', googleFont: true },
  { name: 'Libre Baskerville', category: 'serif', weights: [400, 700], fallback: 'Libre Baskerville, Georgia, serif', googleFont: true },
  { name: 'EB Garamond', category: 'serif', weights: [400, 500, 600, 700], fallback: 'EB Garamond, Georgia, serif', googleFont: true },
  { name: 'Cormorant Garamond', category: 'serif', weights: [300, 400, 500, 600, 700], fallback: 'Cormorant Garamond, Georgia, serif', googleFont: true },

  // Display & Creative Fonts
  { name: 'Oswald', category: 'display', weights: [300, 400, 500, 600, 700], fallback: 'Oswald, Arial, sans-serif', googleFont: true },
  { name: 'Bebas Neue', category: 'display', weights: [400], fallback: 'Bebas Neue, Arial, sans-serif', googleFont: true },
  { name: 'Anton', category: 'display', weights: [400], fallback: 'Anton, Arial, sans-serif', googleFont: true },
  { name: 'Righteous', category: 'display', weights: [400], fallback: 'Righteous, Arial, sans-serif', googleFont: true },
  { name: 'Fredoka One', category: 'display', weights: [400], fallback: 'Fredoka One, Arial, sans-serif', googleFont: true },
  { name: 'Bangers', category: 'display', weights: [400], fallback: 'Bangers, Arial, sans-serif', googleFont: true },
  { name: 'Lobster', category: 'display', weights: [400], fallback: 'Lobster, Arial, sans-serif', googleFont: true },
  { name: 'Pacifico', category: 'display', weights: [400], fallback: 'Pacifico, Arial, sans-serif', googleFont: true },

  // Handwriting Fonts
  { name: 'Dancing Script', category: 'handwriting', weights: [400, 500, 600, 700], fallback: 'Dancing Script, cursive', googleFont: true },
  { name: 'Permanent Marker', category: 'handwriting', weights: [400], fallback: 'Permanent Marker, cursive', googleFont: true },
  { name: 'Kalam', category: 'handwriting', weights: [300, 400, 700], fallback: 'Kalam, cursive', googleFont: true },
  { name: 'Shadows Into Light', category: 'handwriting', weights: [400], fallback: 'Shadows Into Light, cursive', googleFont: true },
  { name: 'Caveat', category: 'handwriting', weights: [400, 500, 600, 700], fallback: 'Caveat, cursive', googleFont: true },

  // Monospace Fonts
  { name: 'Source Code Pro', category: 'monospace', weights: [300, 400, 500, 600, 700], fallback: 'Source Code Pro, Consolas, monospace', googleFont: true },
  { name: 'Fira Code', category: 'monospace', weights: [300, 400, 500, 600, 700], fallback: 'Fira Code, Consolas, monospace', googleFont: true },
  { name: 'JetBrains Mono', category: 'monospace', weights: [300, 400, 500, 600, 700], fallback: 'JetBrains Mono, Consolas, monospace', googleFont: true },
  { name: 'Roboto Mono', category: 'monospace', weights: [300, 400, 500, 700], fallback: 'Roboto Mono, Consolas, monospace', googleFont: true },
  { name: 'Ubuntu Mono', category: 'monospace', weights: [400, 700], fallback: 'Ubuntu Mono, Consolas, monospace', googleFont: true },
  { name: 'Inconsolata', category: 'monospace', weights: [300, 400, 500, 600, 700], fallback: 'Inconsolata, Consolas, monospace', googleFont: true },

  // Additional Popular Fonts
  { name: 'DM Sans', category: 'sans-serif', weights: [400, 500, 700], fallback: 'DM Sans, Arial, sans-serif', googleFont: true, popular: true },
  { name: 'Manrope', category: 'sans-serif', weights: [300, 400, 500, 600, 700, 800], fallback: 'Manrope, Arial, sans-serif', googleFont: true },
  { name: 'Space Grotesk', category: 'sans-serif', weights: [300, 400, 500, 600, 700], fallback: 'Space Grotesk, Arial, sans-serif', googleFont: true },
  { name: 'Outfit', category: 'sans-serif', weights: [300, 400, 500, 600, 700, 800, 900], fallback: 'Outfit, Arial, sans-serif', googleFont: true },
  { name: 'Sora', category: 'sans-serif', weights: [300, 400, 500, 600, 700, 800], fallback: 'Sora, Arial, sans-serif', googleFont: true },
  { name: 'Plus Jakarta Sans', category: 'sans-serif', weights: [300, 400, 500, 600, 700, 800], fallback: 'Plus Jakarta Sans, Arial, sans-serif', googleFont: true },
  { name: 'Figtree', category: 'sans-serif', weights: [300, 400, 500, 600, 700, 800, 900], fallback: 'Figtree, Arial, sans-serif', googleFont: true },
  { name: 'Rubik', category: 'sans-serif', weights: [300, 400, 500, 600, 700, 800, 900], fallback: 'Rubik, Arial, sans-serif', googleFont: true },
  { name: 'Quicksand', category: 'sans-serif', weights: [300, 400, 500, 600, 700], fallback: 'Quicksand, Arial, sans-serif', googleFont: true },
  { name: 'Comfortaa', category: 'sans-serif', weights: [300, 400, 500, 600, 700], fallback: 'Comfortaa, Arial, sans-serif', googleFont: true },
];

class FontLoader {
  private loadedFonts = new Set<string>();
  private loadingPromises = new Map<string, Promise<void>>();
  private fontCache = new Map<string, FontDefinition>();
  private customFontsLoaded = false;

  constructor() {
    // Build font cache for quick lookups
    PROFESSIONAL_FONTS.forEach(font => {
      this.fontCache.set(font.name, font);
    });
    
    // Load custom fonts from database
    this.loadCustomFonts();
    
    // Preload popular fonts
    this.preloadPopularFonts();
  }

  private async loadCustomFonts() {
    if (this.customFontsLoaded) return;
    
    try {
      const response = await fetch('/api/fonts');
      if (response.ok) {
        const data = await response.json();
        const customFonts = data.fonts || [];
        
        const loadPromises: Promise<void>[] = [];
        
        customFonts.forEach((font: any) => {
          if (!font.is_active) return; // Skip inactive fonts
          
          // Extract weights from font_files if available, otherwise use weights array
          let weights: number[] = font.weights || [400];
          if (font.font_files && Array.isArray(font.font_files) && font.font_files.length > 0) {
            weights = font.font_files.map((f: any) => f.weight || 400);
            // Remove duplicates and sort
            weights = Array.from(new Set(weights)).sort((a: number, b: number) => a - b);
          }
          
          // Convert custom font to FontDefinition
          const fontDef: FontDefinition = {
            name: font.family_name,
            category: font.category as FontDefinition['category'],
            weights: weights,
            fallback: `${font.family_name}, Arial, sans-serif`,
            googleFont: false, // Custom fonts are not Google Fonts
            popular: font.is_popular || false,
          };
          
          // Add to cache
          this.fontCache.set(font.family_name, fontDef);
          
          // Load the font file(s) asynchronously
          loadPromises.push(this.loadCustomFontFile(font));
        });
        
        // Wait for all fonts to be loaded
        await Promise.all(loadPromises);
        
        this.customFontsLoaded = true;
      }
    } catch (error) {
      console.error('Failed to load custom fonts:', error);
    }
  }

  private async loadCustomFontFile(font: any) {
    // Check if font is already loaded
    if (this.loadedFonts.has(font.family_name)) {
      return Promise.resolve();
    }

    // If font has multiple files (font family), load all of them
    if (font.font_files && Array.isArray(font.font_files) && font.font_files.length > 0) {
      const loadPromises = font.font_files.map((file: any) => {
        return new Promise<void>((resolve) => {
          const fontFace = new FontFace(
            font.family_name,
            `url(${file.file_url}) format('${file.file_format}')`,
            {
              weight: file.weight || 400,
              style: file.style || 'normal'
            }
          );

          fontFace.load().then((loadedFont) => {
            document.fonts.add(loadedFont);
            resolve();
          }).catch((error) => {
            console.error(`Failed to load font file ${file.file_url}:`, error);
            resolve(); // Resolve anyway to not block
          });
        });
      });

      await Promise.all(loadPromises);
      this.loadedFonts.add(font.family_name);
      return Promise.resolve();
    }

    // Single file font (backward compatibility)
    return new Promise<void>((resolve) => {
      const fontFace = new FontFace(
        font.family_name,
        `url(${font.file_url}) format('${font.file_format}')`
      );

      fontFace.load().then((loadedFont) => {
        document.fonts.add(loadedFont);
        this.loadedFonts.add(font.family_name);
        resolve();
      }).catch((error) => {
        console.error(`Failed to load custom font ${font.family_name}:`, error);
        this.loadedFonts.add(font.family_name);
        resolve(); // Resolve anyway to not block
      });
    });
  }

  private async preloadPopularFonts() {
    const popularFonts = PROFESSIONAL_FONTS.filter(font => font.popular && font.googleFont);
    await Promise.all(popularFonts.map(font => this.loadFont(font.name)));
  }

  async loadFont(fontName: string): Promise<void> {
    if (this.loadedFonts.has(fontName)) {
      return Promise.resolve();
    }

    if (this.loadingPromises.has(fontName)) {
      return this.loadingPromises.get(fontName)!;
    }

    const font = this.fontCache.get(fontName);
    if (!font) {
      console.warn(`Font ${fontName} not found in font definitions`);
      return Promise.resolve();
    }

    // System fonts don't need loading
    if (!font.googleFont) {
      this.loadedFonts.add(fontName);
      return Promise.resolve();
    }

    const loadPromise = this.loadGoogleFont(font);
    this.loadingPromises.set(fontName, loadPromise);

    try {
      await loadPromise;
      this.loadedFonts.add(fontName);
    } catch (error) {
      console.error(`Failed to load font ${fontName}:`, error);
    } finally {
      this.loadingPromises.delete(fontName);
    }
  }

  private async loadGoogleFont(font: FontDefinition): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if font is already loaded in document
      const existingLink = document.querySelector(`link[href*="${font.name.replace(/\s+/g, '+')}"]`);
      if (existingLink) {
        resolve();
        return;
      }

      // Create Google Fonts URL with multiple weights
      const weights = font.weights.join(',');
      const fontUrl = `https://fonts.googleapis.com/css2?family=${font.name.replace(/\s+/g, '+')}:wght@${weights}&display=swap`;

      // Create and append link element
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = fontUrl;
      
      link.onload = () => {
        // Verify font is actually loaded
        this.verifyFontLoaded(font.name).then(resolve).catch(reject);
      };
      
      link.onerror = () => {
        reject(new Error(`Failed to load font: ${font.name}`));
      };

      document.head.appendChild(link);
    });
  }

  private async verifyFontLoaded(fontName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Font verification timeout: ${fontName}`));
      }, 5000);

      const checkFont = () => {
        if (document.fonts && document.fonts.check) {
          if (document.fonts.check(`16px "${fontName}"`)) {
            clearTimeout(timeout);
            resolve();
          } else {
            setTimeout(checkFont, 100);
          }
        } else {
          // Fallback for browsers without FontFace API
          clearTimeout(timeout);
          resolve();
        }
      };

      checkFont();
    });
  }

  getFontDefinition(fontName: string): FontDefinition | undefined {
    return this.fontCache.get(fontName);
  }

  getFontFallback(fontName: string): string {
    const font = this.fontCache.get(fontName);
    return font?.fallback || `${fontName}, Arial, sans-serif`;
  }

  isLoaded(fontName: string): boolean {
    return this.loadedFonts.has(fontName);
  }

  getFontsByCategory(category: FontDefinition['category']): FontDefinition[] {
    const allFonts = Array.from(this.fontCache.values());
    return allFonts.filter(font => font.category === category);
  }

  getPopularFonts(): FontDefinition[] {
    const allFonts = Array.from(this.fontCache.values());
    return allFonts.filter(font => font.popular);
  }

  getAllFonts(): FontDefinition[] {
    return Array.from(this.fontCache.values());
  }

  async refreshCustomFonts() {
    this.customFontsLoaded = false;
    await this.loadCustomFonts();
  }

  // Public method to force reload custom fonts
  async reloadCustomFonts() {
    console.log('[FontLoader] Reloading custom fonts...');
    this.customFontsLoaded = false;
    // Clear existing custom fonts from cache (keep only PROFESSIONAL_FONTS)
    const professionalFontNames = new Set(PROFESSIONAL_FONTS.map(f => f.name));
    const toDelete: string[] = [];
    Array.from(this.fontCache.entries()).forEach(([name]) => {
      if (!professionalFontNames.has(name)) {
        toDelete.push(name);
      }
    });
    toDelete.forEach(name => {
      this.fontCache.delete(name);
      this.loadedFonts.delete(name);
    });
    console.log('[FontLoader] Cleared', toDelete.length, 'custom fonts from cache');
    await this.loadCustomFonts();
    console.log('[FontLoader] Reloaded custom fonts. Total fonts in cache:', this.fontCache.size);
  }
}

// Create singleton instance only on client side
export const fontLoader = typeof window !== 'undefined' ? new FontLoader() : null;

// Utility function to get font stack with fallbacks
export function getFontStack(fontName: string): string {
  if (!fontLoader) {
    // Fallback for SSR - return basic font stack
    const font = PROFESSIONAL_FONTS.find(f => f.name === fontName);
    return font ? `"${fontName}", ${font.fallback}` : `"${fontName}", system-ui, sans-serif`;
  }
  return fontLoader.getFontFallback(fontName);
}

// Utility function to load font and return promise
export async function ensureFontLoaded(fontName: string): Promise<void> {
  if (!fontLoader) {
    // No-op for SSR
    return Promise.resolve();
  }
  return fontLoader.loadFont(fontName);
}
