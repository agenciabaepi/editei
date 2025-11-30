"use client";

import { useEffect } from 'react';
import { fontLoader, PROFESSIONAL_FONTS } from '@/features/editor/utils/font-loader';

/**
 * Font Preloader Component
 * Preloads popular fonts when the application starts
 */
export const FontPreloader = () => {
  useEffect(() => {
    // Only run on client side
    if (!fontLoader) return;
    
    // Preload popular fonts in the background
    const preloadFonts = async () => {
      const popularFonts = PROFESSIONAL_FONTS.filter(font => font.popular);
      
      // Load fonts in batches to avoid overwhelming the browser
      const batchSize = 3;
      for (let i = 0; i < popularFonts.length; i += batchSize) {
        const batch = popularFonts.slice(i, i + batchSize);
        await Promise.allSettled(
          batch.map(font => fontLoader!.loadFont(font.name))
        );
        
        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    };

    preloadFonts().catch(console.error);
  }, []);

  // This component doesn't render anything
  return null;
};
