import type { RefObject } from "react";
import { createContext } from "react";
import type {
	IconConfig,
	IconState,
	WindowConfig,
	WindowManagerState,
	WindowRegistry,
	WindowState,
} from "../types";

export interface ContainerBounds {
	width: number;
	height: number;
}

export interface WindowManagerContextValue {
	state: WindowManagerState;
	/** The component registry for resolving componentId to components */
	registry: WindowRegistry | null;
	openWindow: (config: WindowConfig) => void;
	closeWindow: (id: string) => void;
	focusWindow: (id: string) => void;
	updateWindow: (id: string, updates: Partial<WindowState>) => void;
	bringToFront: (id: string) => void;
	sendToBack: (id: string) => void;
	minimizeWindow: (id: string) => void;
	maximizeWindow: (id: string) => void;
	restoreWindow: (id: string) => void;
	/** Ref to the container element for bounds constraints */
	boundsRef: RefObject<HTMLElement | null> | null;
	/** Get current container bounds, or null if boundsRef is not set */
	getContainerBounds: () => ContainerBounds | null;

	// Icon state and operations
	/** All desktop icons */
	icons: IconState[];
	/** Currently selected icon IDs */
	selectedIconIds: string[];
	/** Add a new icon to the desktop */
	addIcon: (config: IconConfig) => void;
	/** Remove an icon from the desktop */
	removeIcon: (id: string) => void;
	/** Update an existing icon */
	updateIcon: (id: string, updates: Partial<IconState>) => void;
	/** Select an icon. If multiSelect is true, adds to selection; otherwise replaces selection */
	selectIcon: (id: string, multiSelect?: boolean) => void;
	/** Deselect a specific icon */
	deselectIcon: (id: string) => void;
	/** Deselect all icons */
	deselectAllIcons: () => void;
	/** Launch a window from an icon (opens window with icon's componentId) */
	launchIcon: (id: string) => void;

	// Convenience helpers
	/** Find a window by its componentId. Returns undefined if not found. */
	getWindowByComponentId: (componentId: string) => WindowState | undefined;
	/** Check if any window with the given componentId is currently open. */
	isWindowOpen: (componentId: string) => boolean;
	/** Open a new window or focus an existing one with the same componentId. Restores if minimized. */
	openOrFocusWindow: (config: WindowConfig) => void;
}

export const WindowManagerContext =
	createContext<WindowManagerContextValue | null>(null);
