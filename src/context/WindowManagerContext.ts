import type { RefObject } from "react";
import { createContext } from "react";
import type { WindowConfig, WindowManagerState, WindowState } from "../types";

export interface ContainerBounds {
	width: number;
	height: number;
}

export interface WindowManagerContextValue {
	state: WindowManagerState;
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
}

export const WindowManagerContext =
	createContext<WindowManagerContextValue | null>(null);
