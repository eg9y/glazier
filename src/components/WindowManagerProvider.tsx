import {
	type ReactNode,
	type RefObject,
	useCallback,
	useMemo,
	useState,
} from "react";
import {
	type ContainerBounds,
	WindowManagerContext,
	type WindowManagerContextValue,
} from "../context/WindowManagerContext";
import type { WindowConfig, WindowManagerState, WindowState } from "../types";

export interface WindowManagerProviderProps {
	children: ReactNode;
	defaultWindows?: WindowState[];
	/** Ref to container element for bounds constraints. If provided, windows will be constrained within this container. */
	boundsRef?: RefObject<HTMLElement | null>;
}

export function WindowManagerProvider({
	children,
	defaultWindows = [],
	boundsRef,
}: WindowManagerProviderProps) {
	const [state, setState] = useState<WindowManagerState>(() => ({
		windows: defaultWindows,
		activeWindowId: defaultWindows[0]?.id ?? null,
	}));

	const openWindow = useCallback((config: WindowConfig) => {
		setState((prev) => {
			if (prev.windows.some((w) => w.id === config.id)) {
				return prev;
			}
			const maxZ = Math.max(0, ...prev.windows.map((w) => w.zIndex));
			const newWindow: WindowState = {
				...config,
				zIndex: config.zIndex ?? maxZ + 1,
				displayState: config.displayState ?? "normal",
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
			const win = prev.windows.find((w) => w.id === id);
			if (!win) {
				return prev;
			}
			// Don't focus minimized windows - restore them first
			if (win.displayState === "minimized") {
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

	const minimizeWindow = useCallback((id: string) => {
		setState((prev) => {
			const win = prev.windows.find((w) => w.id === id);
			if (!win || win.displayState === "minimized") {
				return prev;
			}

			// Find next window to focus (excluding the one being minimized)
			const otherWindows = prev.windows.filter(
				(w) => w.id !== id && w.displayState !== "minimized",
			);
			const nextActiveId =
				prev.activeWindowId === id
					? (otherWindows[otherWindows.length - 1]?.id ?? null)
					: prev.activeWindowId;

			return {
				windows: prev.windows.map((w) =>
					w.id === id ? { ...w, displayState: "minimized" as const } : w,
				),
				activeWindowId: nextActiveId,
			};
		});
	}, []);

	const maximizeWindow = useCallback((id: string) => {
		setState((prev) => {
			const win = prev.windows.find((w) => w.id === id);
			if (!win || win.displayState === "maximized") {
				return prev;
			}

			const maxZ = Math.max(...prev.windows.map((w) => w.zIndex));
			return {
				windows: prev.windows.map((w) =>
					w.id === id
						? {
								...w,
								displayState: "maximized" as const,
								previousBounds: { position: w.position, size: w.size },
								zIndex: maxZ + 1,
							}
						: w,
				),
				activeWindowId: id,
			};
		});
	}, []);

	const restoreWindow = useCallback((id: string) => {
		setState((prev) => {
			const win = prev.windows.find((w) => w.id === id);
			if (!win || win.displayState === "normal") {
				return prev;
			}

			const maxZ = Math.max(...prev.windows.map((w) => w.zIndex));
			return {
				windows: prev.windows.map((w) => {
					if (w.id !== id) {
						return w;
					}
					// Restore from maximized - use previousBounds
					if (w.displayState === "maximized" && w.previousBounds) {
						return {
							...w,
							displayState: "normal" as const,
							position: w.previousBounds.position,
							size: w.previousBounds.size,
							previousBounds: undefined,
							zIndex: maxZ + 1,
						};
					}
					// Restore from minimized
					return {
						...w,
						displayState: "normal" as const,
						zIndex: maxZ + 1,
					};
				}),
				activeWindowId: id,
			};
		});
	}, []);

	const getContainerBounds = useCallback((): ContainerBounds | null => {
		if (!boundsRef?.current) {
			return null;
		}
		return {
			width: boundsRef.current.clientWidth,
			height: boundsRef.current.clientHeight,
		};
	}, [boundsRef]);

	const value: WindowManagerContextValue = useMemo(
		() => ({
			state,
			openWindow,
			closeWindow,
			focusWindow,
			updateWindow,
			bringToFront,
			sendToBack,
			minimizeWindow,
			maximizeWindow,
			restoreWindow,
			boundsRef: boundsRef ?? null,
			getContainerBounds,
		}),
		[
			state,
			openWindow,
			closeWindow,
			focusWindow,
			updateWindow,
			bringToFront,
			sendToBack,
			minimizeWindow,
			maximizeWindow,
			restoreWindow,
			boundsRef,
			getContainerBounds,
		],
	);

	return (
		<WindowManagerContext.Provider value={value}>
			{children}
		</WindowManagerContext.Provider>
	);
}
