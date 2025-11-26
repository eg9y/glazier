import { createContext } from "react";
import type { WindowConfig, WindowManagerState, WindowState } from "../types";

export interface WindowManagerContextValue {
	state: WindowManagerState;
	openWindow: (config: WindowConfig) => void;
	closeWindow: (id: string) => void;
	focusWindow: (id: string) => void;
	updateWindow: (id: string, updates: Partial<WindowState>) => void;
	bringToFront: (id: string) => void;
	sendToBack: (id: string) => void;
}

export const WindowManagerContext =
	createContext<WindowManagerContextValue | null>(null);
