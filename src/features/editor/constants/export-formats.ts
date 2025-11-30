export interface ExportFormat {
  id: string;
  name: string;
  extension: string;
  mimeType: string;
  description: string;
  quality?: number;
  supportsTransparency: boolean;
  category: 'image' | 'vector' | 'document';
  requiresPro?: boolean;
}

export const EXPORT_FORMATS: ExportFormat[] = [
  // Image Formats
  {
    id: 'png',
    name: 'PNG',
    extension: 'png',
    mimeType: 'image/png',
    description: 'High quality with transparency support',
    supportsTransparency: true,
    category: 'image'
  },
  {
    id: 'jpg',
    name: 'JPEG',
    extension: 'jpg',
    mimeType: 'image/jpeg',
    description: 'Compressed format, smaller file size',
    quality: 0.9,
    supportsTransparency: false,
    category: 'image'
  },
  {
    id: 'webp',
    name: 'WebP',
    extension: 'webp',
    mimeType: 'image/webp',
    description: 'Modern format with excellent compression',
    quality: 0.9,
    supportsTransparency: true,
    category: 'image',
    requiresPro: true
  },
  // Vector Formats
  {
    id: 'svg',
    name: 'SVG',
    extension: 'svg',
    mimeType: 'image/svg+xml',
    description: 'Scalable vector format',
    supportsTransparency: true,
    category: 'vector',
    requiresPro: true
  },
  // Document Formats
  {
    id: 'pdf',
    name: 'PDF',
    extension: 'pdf',
    mimeType: 'application/pdf',
    description: 'Portable document format',
    supportsTransparency: true,
    category: 'document',
    requiresPro: true
  },
  {
    id: 'json',
    name: 'JSON Template',
    extension: 'json',
    mimeType: 'application/json',
    description: 'Editable template format for reuse',
    supportsTransparency: true,
    category: 'document'
  }
];

export interface ExportOptions {
  format: ExportFormat;
  quality?: number;
  scale?: number;
  width?: number;
  height?: number;
  backgroundColor?: string;
  includeBackground?: boolean;
}

export function getFormatsByCategory(category: ExportFormat['category'], isPro: boolean = false): ExportFormat[] {
  return EXPORT_FORMATS.filter(format => format.category === category);
}

export function getAvailableFormats(isPro: boolean = false): ExportFormat[] {
  return EXPORT_FORMATS.filter(format => isPro || !format.requiresPro);
}

export function getFormatById(id: string): ExportFormat | undefined {
  return EXPORT_FORMATS.find(format => format.id === id);
}
