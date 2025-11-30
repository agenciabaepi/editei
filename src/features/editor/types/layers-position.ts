export type LayersPanelPosition = 
  | "floating-bottom"
  | "floating-top"
  | "floating-left"
  | "floating-right"
  | "sidebar-left"
  | "sidebar-right"
  | "floating-custom";

export interface LayersPanelConfig {
  position: LayersPanelPosition;
  isVisible: boolean;
  customPosition?: {
    x: number;
    y: number;
  };
  size?: {
    width: number;
    height: number;
  };
}

export const DEFAULT_LAYERS_CONFIG: LayersPanelConfig = {
  position: "floating-bottom",
  isVisible: true,
  customPosition: { x: 0, y: 0 },
  size: { width: 600, height: 200 }
};

export const POSITION_PRESETS = {
  "floating-bottom": {
    style: "fixed bottom-4 left-1/2 transform -translate-x-1/2",
    label: "Bottom Center"
  },
  "floating-top": {
    style: "fixed top-20 left-1/2 transform -translate-x-1/2",
    label: "Top Center"
  },
  "floating-left": {
    style: "fixed left-4 top-1/2 transform -translate-y-1/2",
    label: "Left Side"
  },
  "floating-right": {
    style: "fixed right-4 top-1/2 transform -translate-y-1/2",
    label: "Right Side"
  },
  "sidebar-left": {
    style: "relative",
    label: "Left Sidebar"
  },
  "sidebar-right": {
    style: "relative",
    label: "Right Sidebar"
  },
  "floating-custom": {
    style: "fixed",
    label: "Custom Position"
  }
};
