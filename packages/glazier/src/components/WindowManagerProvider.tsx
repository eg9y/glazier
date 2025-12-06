import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
	type ContainerBounds,
	WindowManagerContext,
	type WindowManagerContextValue,
} from "../context/WindowManagerContext";
import type {
	IconConfig,
	IconState,
	WindowConfig,
	WindowManagerProviderProps,
	WindowManagerState,
	WindowState,
} from "../types";
import { generateWindowId } from "../utils/id";

export function WindowManagerProvider({
	children,
	defaultWindows = [],
	defaultIcons = [],
	registry,
	defaultWindowConfigs,
	boundsRef,
	initialFocusedWindowId,
	onFocusChange,
}: WindowManagerProviderProps) {
	const [state, setState] = useState<WindowManagerState>(() => {
		// Use initialFocusedWindowId if provided and valid, otherwise fall back to first window
		const initialFocused =
			initialFocusedWindowId &&
			defaultWindows.some((w) => w.id === initialFocusedWindowId)
				? initialFocusedWindowId
				: (defaultWindows[0]?.id ?? null);

		return {
			windows: defaultWindows,
			activeWindowId: initialFocused,
		};
	});

	// Track previous activeWindowId to detect changes
	const prevActiveWindowIdRef = useRef(state.activeWindowId);

	// Notify when focus changes
	useEffect(() => {
		if (prevActiveWindowIdRef.current !== state.activeWindowId) {
			onFocusChange?.(state.activeWindowId);
			prevActiveWindowIdRef.current = state.activeWindowId;
		}
	}, [state.activeWindowId, onFocusChange]);

	// Icon state
	const [icons, setIcons] = useState<IconState[]>(defaultIcons);
	const [selectedIconIds, setSelectedIconIds] = useState<string[]>([]);

	// Animation support: track windows in closing animation
	const [closingWindowIds, setClosingWindowIds] = useState<Set<string>>(
		() => new Set(),
	);

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
		// Mark window as closing (triggers animation)
		// Window stays in state until finalizeClose is called
		setClosingWindowIds((prev) => new Set(prev).add(id));

		// Update active window immediately
		setState((prev) => {
			const otherWindows = prev.windows.filter((w) => w.id !== id);
			const newActiveId =
				prev.activeWindowId === id
					? (otherWindows[otherWindows.length - 1]?.id ?? null)
					: prev.activeWindowId;
			return {
				...prev,
				activeWindowId: newActiveId,
			};
		});
	}, []);

	const finalizeClose = useCallback((id: string) => {
		// Remove from closing set
		setClosingWindowIds((prev) => {
			const next = new Set(prev);
			next.delete(id);
			return next;
		});

		// Actually remove from state
		setState((prev) => ({
			...prev,
			windows: prev.windows.filter((w) => w.id !== id),
		}));
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

	// Icon operations
	const addIcon = useCallback((config: IconConfig) => {
		setIcons((prev) => {
			if (prev.some((icon) => icon.id === config.id)) {
				return prev;
			}
			return [...prev, config];
		});
	}, []);

	const removeIcon = useCallback((id: string) => {
		setIcons((prev) => prev.filter((icon) => icon.id !== id));
		setSelectedIconIds((prev) => prev.filter((iconId) => iconId !== id));
	}, []);

	const updateIcon = useCallback((id: string, updates: Partial<IconState>) => {
		setIcons((prev) =>
			prev.map((icon) => (icon.id === id ? { ...icon, ...updates } : icon)),
		);
	}, []);

	const selectIcon = useCallback((id: string, multiSelect = false) => {
		setSelectedIconIds((prev) => {
			if (multiSelect) {
				// Toggle selection in multi-select mode
				if (prev.includes(id)) {
					return prev.filter((iconId) => iconId !== id);
				}
				return [...prev, id];
			}
			// Single select mode - replace selection
			return [id];
		});
	}, []);

	const deselectIcon = useCallback((id: string) => {
		setSelectedIconIds((prev) => prev.filter((iconId) => iconId !== id));
	}, []);

	const deselectAllIcons = useCallback(() => {
		setSelectedIconIds([]);
	}, []);

	// Convenience helpers
	const getWindowByComponentId = useCallback(
		(componentId: string) =>
			state.windows.find((w) => w.componentId === componentId),
		[state.windows],
	);

	const isWindowOpen = useCallback(
		(componentId: string) =>
			state.windows.some((w) => w.componentId === componentId),
		[state.windows],
	);

	const launchIcon = useCallback(
		(id: string) => {
			const icon = icons.find((i) => i.id === id);
			if (!icon) {
				return;
			}

			// Look up default config for this componentId
			const defaultConfig = defaultWindowConfigs?.[icon.componentId];

			// Generate a unique window ID based on the icon
			const windowId = generateWindowId();

			openWindow({
				id: windowId,
				title: defaultConfig?.title ?? icon.label,
				componentId: icon.componentId,
				componentProps: icon.componentProps,
				position: defaultConfig?.position ?? { x: 100, y: 100 },
				size: defaultConfig?.size ?? { width: 400, height: 300 },
				// Store icon position for open/close animations
				animationSource: icon.position,
			});
		},
		[icons, openWindow, defaultWindowConfigs],
	);

	const openOrFocusWindow = useCallback(
		(config: WindowConfig) => {
			const existing = state.windows.find(
				(w) => w.componentId === config.componentId,
			);
			if (existing) {
				if (existing.displayState === "minimized") {
					restoreWindow(existing.id);
				} else {
					focusWindow(existing.id);
				}
			} else {
				openWindow(config);
			}
		},
		[state.windows, focusWindow, restoreWindow, openWindow],
	);

	const value: WindowManagerContextValue = useMemo(
		() => ({
			state,
			registry: registry ?? null,
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
			// Animation support
			closingWindowIds,
			finalizeClose,
			// Icon state and operations
			icons,
			selectedIconIds,
			addIcon,
			removeIcon,
			updateIcon,
			selectIcon,
			deselectIcon,
			deselectAllIcons,
			launchIcon,
			// Convenience helpers
			getWindowByComponentId,
			isWindowOpen,
			openOrFocusWindow,
		}),
		[
			state,
			registry,
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
			closingWindowIds,
			finalizeClose,
			icons,
			selectedIconIds,
			addIcon,
			removeIcon,
			updateIcon,
			selectIcon,
			deselectIcon,
			deselectAllIcons,
			launchIcon,
			getWindowByComponentId,
			isWindowOpen,
			openOrFocusWindow,
		],
	);

	return (
		<WindowManagerContext.Provider value={value}>
			{children}
		</WindowManagerContext.Provider>
	);
}
