import { useState, useCallback, useEffect } from "react";
import { LayersPanelPosition, LayersPanelConfig, DEFAULT_LAYERS_CONFIG } from "../types/layers-position";

const STORAGE_KEY = "layers-panel-config";

export const useLayersPosition = () => {
  const [config, setConfig] = useState<LayersPanelConfig>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          return { ...DEFAULT_LAYERS_CONFIG, ...JSON.parse(saved) };
        } catch {
          return DEFAULT_LAYERS_CONFIG;
        }
      }
    }
    return DEFAULT_LAYERS_CONFIG;
  });

  // Save to localStorage whenever config changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    }
  }, [config]);

  const updatePosition = useCallback((position: LayersPanelPosition) => {
    setConfig(prev => ({ ...prev, position }));
  }, []);

  const updateCustomPosition = useCallback((x: number, y: number) => {
    setConfig(prev => ({
      ...prev,
      position: "floating-custom",
      customPosition: { x, y }
    }));
  }, []);

  const updateSize = useCallback((width: number, height: number) => {
    setConfig(prev => ({
      ...prev,
      size: { width, height }
    }));
  }, []);

  const toggleVisibility = useCallback(() => {
    setConfig(prev => ({ ...prev, isVisible: !prev.isVisible }));
  }, []);

  const resetToDefault = useCallback(() => {
    setConfig(DEFAULT_LAYERS_CONFIG);
  }, []);

  return {
    config,
    isVisible: config.isVisible,
    setVisible: (visible: boolean) => {
      setConfig(prev => ({ ...prev, isVisible: visible }));
    },
    updatePosition,
    updateCustomPosition,
    updateSize,
    toggleVisibility,
    resetToDefault
  };
};
