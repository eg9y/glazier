import { type ReactNode, useCallback, useMemo, useState } from "react";
import {
	WindowManagerContext,
	type WindowManagerContextValue,
} from "../context/WindowManagerContext";
import type { WindowConfig, WindowManagerState, WindowState } from "../types";

export interface WindowManagerProviderProps {
	children: ReactNode;
	defaultWindows?: WindowState[];
}

export function WindowManagerProvider({
	children,
	defaultWindows = [],
}: WindowManagerProviderProps) {
	const [state, setState] = useState<WindowManagerState>(() => ({
		windows: defaultWindows,
		activeWindowId: defaultWindows[0]?.id ?? null,
	}));

	const getMaxZIndex = useCallback(() => {
		if (state.windows.length === 0) {
			return 0;
		}
		return Math.max(...state.windows.map((w) => w.zIndex));
	}, [state.windows]);

	const openWindow = useCallback((config: WindowConfig) => {
		setState((prev) => {
			if (prev.windows.some((w) => w.id === config.id)) {
				return prev;
			}
			const maxZ = Math.max(0, ...prev.windows.map((w) => w.zIndex));
			const newWindow: WindowState = {
				...config,
				zIndex: config.zIndex ?? maxZ + 1,
			};
			return {
				windows: [...prev.windows, newWindow],
				activeWindowId: newWindow.id,
			};
		});
	}, []);

	const closeWindow = useCallback((id: string) => {
		setState((prev) => {
			const filtered = prev.windows.filter((w) => w.id !== id);
			const newActiveId =
				prev.activeWindowId === id
					? (filtered[filtered.length - 1]?.id ?? null)
					: prev.activeWindowId;
			return {
				windows: filtered,
				activeWindowId: newActiveId,
			};
		});
	}, []);

	const focusWindow = useCallback((id: string) => {
		setState((prev) => {
			if (!prev.windows.some((w) => w.id === id)) {
				return prev;
			}
			const maxZ = Math.max(...prev.windows.map((w) => w.zIndex));
			return {
				windows: prev.windows.map((w) =>
					w.id === id ? { ...w, zIndex: maxZ + 1 } : w,
				),
				activeWindowId: id,
			};
		});
	}, []);

	const updateWindow = useCallback(
		(id: string, updates: Partial<WindowState>) => {
			setState((prev) => ({
				...prev,
				windows: prev.windows.map((w) =>
					w.id === id ? { ...w, ...updates } : w,
				),
			}));
		},
		[],
	);

	const bringToFront = useCallback((id: string) => {
		setState((prev) => {
			const maxZ = Math.max(...prev.windows.map((w) => w.zIndex));
			return {
				...prev,
				windows: prev.windows.map((w) =>
					w.id === id ? { ...w, zIndex: maxZ + 1 } : w,
				),
			};
		});
	}, []);

	const sendToBack = useCallback((id: string) => {
		setState((prev) => {
			const minZ = Math.min(...prev.windows.map((w) => w.zIndex));
			return {
				...prev,
				windows: prev.windows.map((w) =>
					w.id === id ? { ...w, zIndex: minZ - 1 } : w,
				),
			};
		});
	}, []);

	const value: WindowManagerContextValue = useMemo(
		() => ({
			state,
			openWindow,
			closeWindow,
			focusWindow,
			updateWindow,
			bringToFront,
			sendToBack,
		}),
		[
			state,
			openWindow,
			closeWindow,
			focusWindow,
			updateWindow,
			bringToFront,
			sendToBack,
		],
	);

	return (
		<WindowManagerContext.Provider value={value}>
			{children}
		</WindowManagerContext.Provider>
	);
}
