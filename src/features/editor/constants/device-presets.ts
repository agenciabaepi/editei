export interface DevicePreset {
  id: string;
  name: string;
  category: 'mobile' | 'tablet' | 'desktop' | 'social' | 'print' | 'custom';
  width: number;
  height: number;
  description?: string;
  icon?: string;
}

export const DEVICE_PRESETS: DevicePreset[] = [
  // Mobile Devices
  {
    id: 'iphone-15-pro',
    name: 'iPhone 15 Pro',
    category: 'mobile',
    width: 393,
    height: 852,
    description: 'iPhone 15 Pro screen size'
  },
  {
    id: 'iphone-se',
    name: 'iPhone SE',
    category: 'mobile',
    width: 375,
    height: 667,
    description: 'iPhone SE screen size'
  },
  {
    id: 'samsung-galaxy-s24',
    name: 'Samsung Galaxy S24',
    category: 'mobile',
    width: 360,
    height: 780,
    description: 'Samsung Galaxy S24 screen size'
  },
  {
    id: 'mobile-story',
    name: 'Mobile Story',
    category: 'mobile',
    width: 1080,
    height: 1920,
    description: 'Standard mobile story format'
  },

  // Tablet Devices
  {
    id: 'ipad-pro-12',
    name: 'iPad Pro 12.9"',
    category: 'tablet',
    width: 1024,
    height: 1366,
    description: 'iPad Pro 12.9 inch screen size'
  },
  {
    id: 'ipad-air',
    name: 'iPad Air',
    category: 'tablet',
    width: 820,
    height: 1180,
    description: 'iPad Air screen size'
  },
  {
    id: 'samsung-tab-s9',
    name: 'Samsung Tab S9',
    category: 'tablet',
    width: 800,
    height: 1280,
    description: 'Samsung Galaxy Tab S9 screen size'
  },

  // Desktop Devices
  {
    id: 'desktop-hd',
    name: 'Desktop HD',
    category: 'desktop',
    width: 1920,
    height: 1080,
    description: 'Standard HD desktop resolution'
  },
  {
    id: 'desktop-4k',
    name: 'Desktop 4K',
    category: 'desktop',
    width: 3840,
    height: 2160,
    description: '4K desktop resolution'
  },
  {
    id: 'macbook-pro-16',
    name: 'MacBook Pro 16"',
    category: 'desktop',
    width: 3456,
    height: 2234,
    description: 'MacBook Pro 16 inch screen size'
  },
  {
    id: 'imac-24',
    name: 'iMac 24"',
    category: 'desktop',
    width: 4480,
    height: 2520,
    description: 'iMac 24 inch screen size'
  },

  // Social Media
  {
    id: 'instagram-post',
    name: 'Instagram Post',
    category: 'social',
    width: 1080,
    height: 1080,
    description: 'Instagram square post'
  },
  {
    id: 'instagram-story',
    name: 'Instagram Story',
    category: 'social',
    width: 1080,
    height: 1920,
    description: 'Instagram story format'
  },
  {
    id: 'facebook-post',
    name: 'Facebook Post',
    category: 'social',
    width: 1200,
    height: 630,
    description: 'Facebook post image'
  },
  {
    id: 'facebook-cover',
    name: 'Facebook Cover',
    category: 'social',
    width: 1640,
    height: 859,
    description: 'Facebook cover photo'
  },
  {
    id: 'twitter-post',
    name: 'Twitter Post',
    category: 'social',
    width: 1200,
    height: 675,
    description: 'Twitter post image'
  },
  {
    id: 'twitter-header',
    name: 'Twitter Header',
    category: 'social',
    width: 1500,
    height: 500,
    description: 'Twitter header image'
  },
  {
    id: 'linkedin-post',
    name: 'LinkedIn Post',
    category: 'social',
    width: 1200,
    height: 627,
    description: 'LinkedIn post image'
  },
  {
    id: 'youtube-thumbnail',
    name: 'YouTube Thumbnail',
    category: 'social',
    width: 1280,
    height: 720,
    description: 'YouTube video thumbnail'
  },
  {
    id: 'tiktok-video',
    name: 'TikTok Video',
    category: 'social',
    width: 1080,
    height: 1920,
    description: 'TikTok video format'
  },

  // Print Formats
  {
    id: 'a4-portrait',
    name: 'A4 Portrait',
    category: 'print',
    width: 2480,
    height: 3508,
    description: 'A4 paper portrait (300 DPI)'
  },
  {
    id: 'a4-landscape',
    name: 'A4 Landscape',
    category: 'print',
    width: 3508,
    height: 2480,
    description: 'A4 paper landscape (300 DPI)'
  },
  {
    id: 'letter-portrait',
    name: 'Letter Portrait',
    category: 'print',
    width: 2550,
    height: 3300,
    description: 'US Letter portrait (300 DPI)'
  },
  {
    id: 'letter-landscape',
    name: 'Letter Landscape',
    category: 'print',
    width: 3300,
    height: 2550,
    description: 'US Letter landscape (300 DPI)'
  },
  {
    id: 'business-card',
    name: 'Business Card',
    category: 'print',
    width: 1050,
    height: 600,
    description: 'Standard business card (300 DPI)'
  },
  {
    id: 'poster-a3',
    name: 'A3 Poster',
    category: 'print',
    width: 3508,
    height: 4961,
    description: 'A3 poster size (300 DPI)'
  },
  {
    id: 'flyer-a5',
    name: 'A5 Flyer',
    category: 'print',
    width: 1748,
    height: 2480,
    description: 'A5 flyer size (300 DPI)'
  }
];

export const PRESET_CATEGORIES = [
  { id: 'mobile', name: 'Mobile', icon: '📱' },
  { id: 'tablet', name: 'Tablet', icon: '📱' },
  { id: 'desktop', name: 'Desktop', icon: '💻' },
  { id: 'social', name: 'Social Media', icon: '📢' },
  { id: 'print', name: 'Print', icon: '🖨️' },
  { id: 'custom', name: 'Custom', icon: '⚙️' }
] as const;

export function getPresetsByCategory(category: DevicePreset['category']): DevicePreset[] {
  if (category === 'custom') {
    return getCustomPresets();
  }
  return DEVICE_PRESETS.filter(preset => preset.category === category);
}

export function getPresetById(id: string): DevicePreset | undefined {
  return DEVICE_PRESETS.find(preset => preset.id === id);
}

// Custom presets storage
const CUSTOM_PRESETS_KEY = 'canva-custom-presets';

export function getCustomPresets(): DevicePreset[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(CUSTOM_PRESETS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveCustomPreset(preset: DevicePreset): void {
  if (typeof window === 'undefined') return;
  
  try {
    const customPresets = getCustomPresets();
    customPresets.push(preset);
    localStorage.setItem(CUSTOM_PRESETS_KEY, JSON.stringify(customPresets));
  } catch (error) {
    console.error('Failed to save custom preset:', error);
  }
}

export function deleteCustomPreset(id: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const customPresets = getCustomPresets();
    const filtered = customPresets.filter(preset => preset.id !== id);
    localStorage.setItem(CUSTOM_PRESETS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to delete custom preset:', error);
  }
}

export function createCustomPreset(
  name: string,
  width: number,
  height: number,
  description?: string
): DevicePreset {
  const preset: DevicePreset = {
    id: `custom-${Date.now()}`,
    name,
    category: 'custom',
    width,
    height,
    description
  };
  
  saveCustomPreset(preset);
  return preset;
}

export function getAllPresets(): DevicePreset[] {
  return [...DEVICE_PRESETS, ...getCustomPresets()];
}
