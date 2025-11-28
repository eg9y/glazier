import type { ComponentType } from "react";

export interface Position {
	x: number;
	y: number;
}

export interface Size {
	width: number;
	height: number;
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
 * Type guard to check if a window state uses registry-based rendering.
 */
export function isRegistryWindowState(
	state: WindowState,
): state is WindowState & { componentId: string } {
	return "componentId" in state && typeof state.componentId === "string";
}
