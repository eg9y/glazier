// Types
export type {
	Position,
	Size,
	SizeValue,
	WindowState,
	WindowManagerState,
	WindowConfig,
	WindowDisplayState,
	ResizeDirection,
	WindowRegistry,
	WindowConfigRegistry,
	// Icon types
	IconState,
	IconConfig,
	GridConfig,
	// Provider props
	WindowManagerProviderProps,
} from "./types";
export { isRegistryWindowState } from "./types";

// Context
export { WindowManagerContext } from "./context/WindowManagerContext";
export type { WindowManagerContextValue } from "./context/WindowManagerContext";

// Components
export { WindowManagerProvider } from "./components/WindowManagerProvider";
export { Window } from "./components/Window";
export type { WindowProps } from "./components/Window";
export { Taskbar } from "./components/Taskbar";
export type { TaskbarProps, TaskbarRenderProps } from "./components/Taskbar";
export { SnapPreviewOverlay } from "./components/SnapPreviewOverlay";
export type { SnapPreviewOverlayProps } from "./components/SnapPreviewOverlay";
export { Desktop } from "./components/Desktop";
export type { DesktopProps, DesktopRenderProps } from "./components/Desktop";
export { DesktopIcon } from "./components/DesktopIcon";
export type {
	DesktopIconProps,
	DesktopIconRenderProps,
} from "./components/DesktopIcon";
export { DesktopIconGrid } from "./components/DesktopIconGrid";
export type {
	DesktopIconGridProps,
	DesktopIconGridRenderProps,
} from "./components/DesktopIconGrid";

// Hooks
export { useWindowManager } from "./hooks/useWindowManager";
export { useWindow } from "./hooks/useWindow";
export type { UseWindowReturn } from "./hooks/useWindow";
export { useDrag, constrainPositionToBounds } from "./hooks/useDrag";
export type {
	UseDragOptions,
	UseDragReturn,
	ContainerBounds,
	ResolvedSize,
} from "./hooks/useDrag";
export { useWindowDrag } from "./hooks/useWindowDrag";
export type {
	UseWindowDragOptions,
	UseWindowDragReturn,
	SnapZone,
} from "./hooks/useWindowDrag";
export { useResize } from "./hooks/useResize";
export type { UseResizeOptions, UseResizeReturn } from "./hooks/useResize";
export { useDesktopIcon } from "./hooks/useDesktopIcon";
export type { UseDesktopIconReturn } from "./hooks/useDesktopIcon";
export { useIconDrag } from "./hooks/useIconDrag";
export type {
	UseIconDragOptions,
	UseIconDragReturn,
} from "./hooks/useIconDrag";

// Utils
export { generateWindowId } from "./utils/id";
export { validateWindowState } from "./utils/validateWindowState";
export type { ValidationResult } from "./utils/validateWindowState";
export { snapToGrid, gridToPixel, pixelToGrid } from "./utils/gridSnap";
export {
	isNumericSize,
	toCSSValue,
	resolveToPixels,
	resolveSizeValueToPixels,
	createPixelSize,
} from "./utils/sizeUtils";
