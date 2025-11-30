import { fabric } from "fabric";

export interface Layer {
  id: string;
  name: string;
  type: LayerType;
  visible: boolean;
  locked: boolean;
  opacity: number;
  fabricObject: fabric.Object;
  thumbnail?: string;
  zIndex: number;
}

export type LayerType = 
  | "text"
  | "image" 
  | "shape"
  | "group"
  | "background";

export interface LayerAction {
  type: LayerActionType;
  layerId: string;
  data?: any;
}

export type LayerActionType =
  | "select"
  | "toggle_visibility"
  | "toggle_lock"
  | "duplicate"
  | "delete"
  | "rename"
  | "move_up"
  | "move_down"
  | "bring_to_front"
  | "send_to_back"
  | "change_opacity";

export interface LayerManagerState {
  layers: Layer[];
  selectedLayerId: string | null;
  draggedLayerId: string | null;
}

export interface LayerManagerActions {
  addLayer: (fabricObject: fabric.Object, type: LayerType, name?: string) => void;
  removeLayer: (layerId: string) => void;
  selectLayer: (layerId: string) => void;
  toggleVisibility: (layerId: string) => void;
  toggleLock: (layerId: string) => void;
  duplicateLayer: (layerId: string) => void;
  renameLayer: (layerId: string, newName: string) => void;
  reorderLayers: (fromIndex: number, toIndex: number) => void;
  bringToFront: (layerId: string) => void;
  sendToBack: (layerId: string) => void;
  updateLayerOpacity: (layerId: string, opacity: number) => void;
  refreshLayers: () => void;
}
