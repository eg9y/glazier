// Types
export type {
	Position,
	Size,
	WindowState,
	WindowManagerState,
	WindowConfig,
	WindowDisplayState,
	ResizeDirection,
} from "./types";

// Context
export { WindowManagerContext } from "./context/WindowManagerContext";
export type { WindowManagerContextValue } from "./context/WindowManagerContext";

// Components
export { WindowManagerProvider } from "./components/WindowManagerProvider";
export type { WindowManagerProviderProps } from "./components/WindowManagerProvider";
export { Window } from "./components/Window";
export type { WindowProps } from "./components/Window";
export { Taskbar } from "./components/Taskbar";
export type { TaskbarProps, TaskbarRenderProps } from "./components/Taskbar";
export { SnapPreviewOverlay } from "./components/SnapPreviewOverlay";
export type { SnapPreviewOverlayProps } from "./components/SnapPreviewOverlay";

// Hooks
export { useWindowManager } from "./hooks/useWindowManager";
export { useWindow } from "./hooks/useWindow";
export type { UseWindowReturn } from "./hooks/useWindow";
export { useDrag, constrainPositionToBounds } from "./hooks/useDrag";
export type {
	UseDragOptions,
	UseDragReturn,
	ContainerBounds,
} from "./hooks/useDrag";
export { useWindowDrag } from "./hooks/useWindowDrag";
export type {
	UseWindowDragOptions,
	UseWindowDragReturn,
	SnapZone,
} from "./hooks/useWindowDrag";
export { useResize } from "./hooks/useResize";
export type { UseResizeOptions, UseResizeReturn } from "./hooks/useResize";

// Utils
export { generateWindowId } from "./utils/id";
