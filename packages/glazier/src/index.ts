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
	// Type-safe registry types
	WindowComponentBaseProps,
	TypedWindowRegistry,
} from "./types";
export { isRegistryWindowState, createRegistry } from "./types";

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

// WindowFrame components
export {
	WindowFrame,
	TitleBar,
	Title,
	WindowControls,
	Content,
	WindowFrameContext,
	useWindowFrame,
} from "./components/WindowFrame";
export type {
	WindowFrameProps,
	TitleBarProps,
	TitleProps,
	WindowControlsProps,
	WindowControlType,
	ContentProps,
	WindowFrameContextValue,
} from "./components/WindowFrame";

// ResizeHandles component
export { ResizeHandles } from "./components/ResizeHandles";
export type { ResizeHandlesProps } from "./components/ResizeHandles";

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
export { useIconLauncher } from "./hooks/useIconLauncher";
export type {
	UseIconLauncherOptions,
	UseIconLauncherReturn,
} from "./hooks/useIconLauncher";
export { useWindowRouting } from "./hooks/useWindowRouting";
export type {
	UseWindowRoutingOptions,
	UseWindowRoutingReturn,
} from "./hooks/useWindowRouting";
export { useWindowTransition } from "./hooks/useWindowTransition";
export type {
	WindowTransitionState,
	UseWindowTransitionReturn,
} from "./hooks/useWindowTransition";

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
export {
	getResizeHandleStyle,
	ALL_RESIZE_DIRECTIONS,
	RESIZE_CURSORS,
} from "./utils/resizeHandleStyles";

// Config
export { defineWindows } from "./config";
export type { WindowDefinition, WindowDefinitions } from "./config";

// Routing
export type { RoutingAdapter } from "./routing";
export { createBrowserAdapter } from "./routing";
