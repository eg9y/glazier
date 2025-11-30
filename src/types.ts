import type React from "react";
import type { ComponentType } from "react";

export interface Position {
	x: number;
	y: number;
}

/**
 * A size dimension value that can be either:
 * - A number (interpreted as pixels)
 * - A CSS length string (e.g., "80vh", "50%", "300px", "calc(100% - 20px)")
 */
export type SizeValue = number | string;

export interface Size {
	width: SizeValue;
	height: SizeValue;
}

export type WindowDisplayState = "normal" | "minimized" | "maximized";

export interface WindowState {
	id: string;
	title: string;
	position: Position;
	size: Size;
	zIndex: number;
	displayState: WindowDisplayState;
	/** Stored position/size before maximize, used for restore */
	previousBounds?: { position: Position; size: Size };
	/** References a key in the WindowRegistry (optional, for registry-based rendering) */
	componentId?: string;
	/** Props to pass to the resolved component (must be serializable) */
	componentProps?: Record<string, unknown>;
}

export interface WindowManagerState {
	windows: WindowState[];
	activeWindowId: string | null;
}

export type WindowConfig = Omit<
	WindowState,
	"zIndex" | "displayState" | "previousBounds"
> & {
	zIndex?: number;
	displayState?: WindowDisplayState;
};

export type ResizeDirection = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

/**
 * Registry mapping string keys to React components.
 * Components receive at minimum a `windowId` prop.
 */
export type WindowRegistry = Record<
	string,
	ComponentType<{ windowId: string } & Record<string, unknown>>
>;

/**
 * Registry mapping componentId to default window configuration.
 * Used by launchIcon to create windows with proper sizes/positions.
 */
export type WindowConfigRegistry = Record<
	string,
	Omit<WindowConfig, "id" | "componentId">
>;

/**
 * Type guard to check if a window state uses registry-based rendering.
 */
export function isRegistryWindowState(
	state: WindowState,
): state is WindowState & { componentId: string } {
	return "componentId" in state && typeof state.componentId === "string";
}

// ============================================================================
// Desktop Icon Types
// ============================================================================

export interface IconState {
	id: string;
	/** Display label for the icon */
	label: string;
	/** Component to launch when icon is activated (from WindowRegistry) */
	componentId: string;
	/** Props to pass to the launched window's component */
	componentProps?: Record<string, unknown>;
	/** Icon position on the desktop */
	position: Position;
	/** Consumer-defined icon identifier (e.g., icon name or URL) */
	icon?: string;
}

export type IconConfig = IconState;

export interface GridConfig {
	/** Cell width in pixels */
	cellWidth: number;
	/** Cell height in pixels */
	cellHeight: number;
	/** Gap between cells in pixels */
	gap?: number;
}

// ============================================================================
// Provider Props Types
// ============================================================================

export interface WindowManagerProviderProps {
	children: React.ReactNode;
	defaultWindows?: WindowState[];
	/** Default icons to display on the desktop */
	defaultIcons?: IconState[];
	/** Component registry mapping string keys to React components. Required when using Desktop for registry-based rendering. */
	registry?: WindowRegistry;
	/** Default window configurations by componentId. Used by launchIcon to create windows with proper sizes/positions. */
	defaultWindowConfigs?: WindowConfigRegistry;
	/** Ref to container element for bounds constraints. If provided, windows will be constrained within this container. */
	boundsRef?: React.RefObject<HTMLElement | null>;
	/** Specify which window should be initially focused. If not provided, defaults to first window in defaultWindows. */
	initialFocusedWindowId?: string;
	/** Callback fired when the focused window changes. Useful for syncing with URL routing. */
	onFocusChange?: (windowId: string | null) => void;
}
