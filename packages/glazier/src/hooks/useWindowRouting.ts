import { useCallback, useEffect, useMemo, useRef } from "react";
import type { WindowDefinitions } from "../config";
import { createBrowserAdapter } from "../routing/adapters/browser";
import type { RoutingAdapter } from "../routing/types";
import { useWindowManager } from "./useWindowManager";

export interface UseWindowRoutingOptions<T extends string = string> {
	/** Window definitions from defineWindows(). Provides paths and window configs. */
	windows: WindowDefinitions<T>;
	/** Routing adapter (default: browser adapter with no basePath) */
	adapter?: RoutingAdapter;
	/** Optional callback for custom URL→window handling. Overrides default auto-focus/open behavior. */
	onPathChange?: (componentId: T) => void;
}

export interface UseWindowRoutingReturn<T extends string = string> {
	/** Get the componentId for the current URL path */
	getInitialWindowId: () => T | undefined;
	/** Get the current URL path */
	getCurrentPath: () => string;
}

/**
 * Hook that provides bidirectional sync between window focus and URL.
 *
 * - When a window is focused, the URL updates to match
 * - When the URL changes (e.g., browser back/forward), the corresponding window is focused/opened
 *
 * @example
 * ```tsx
 * function DesktopWithRouting() {
 *     useWindowRouting({
 *         windows,
 *         adapter: createBrowserAdapter({ basePath: "/app" }),
 *     });
 *
 *     return <DesktopContent />;
 * }
 * ```
 */
export function useWindowRouting<T extends string = string>(
	options: UseWindowRoutingOptions<T>,
): UseWindowRoutingReturn<T> {
	const { windows, adapter = createBrowserAdapter(), onPathChange } = options;

	const { state, getWindowByComponentId, focusWindow, openOrFocusWindow } =
		useWindowManager();

	// Extract path maps from windows object
	const pathMap = useMemo(() => windows.getPathMap(), [windows]);
	const pathToIdMap = useMemo(() => windows.getPathToIdMap(), [windows]);

	const lastPathRef = useRef<string | null>(null);

	// Window → URL sync: Update URL when active window changes
	useEffect(() => {
		const activeWindowId = state.activeWindowId;
		if (!activeWindowId) {
			return;
		}

		const win = state.windows.find((w) => w.id === activeWindowId);
		if (!win?.componentId) {
			return;
		}

		const path = pathMap[win.componentId as T];
		if (path && path !== lastPathRef.current) {
			lastPathRef.current = path;
			adapter.navigate(path);
		}
	}, [state.activeWindowId, state.windows, pathMap, adapter]);

	// URL → Window sync: Update window when URL changes (e.g., browser back/forward)
	useEffect(() => {
		if (!adapter.subscribe) {
			return;
		}

		return adapter.subscribe((path) => {
			lastPathRef.current = path;

			const componentId = pathToIdMap[path];
			if (!componentId) {
				return;
			}

			// If custom handler provided, use it
			if (onPathChange) {
				onPathChange(componentId);
				return;
			}

			// Auto-handle: focus existing window or open new one
			const existingWindow = getWindowByComponentId(componentId);
			if (existingWindow) {
				focusWindow(existingWindow.id);
			} else {
				openOrFocusWindow(windows.getWindowConfig(componentId));
			}
		});
	}, [
		adapter,
		pathToIdMap,
		onPathChange,
		windows,
		getWindowByComponentId,
		focusWindow,
		openOrFocusWindow,
	]);

	const getCurrentPath = useCallback(() => {
		return adapter.getCurrentPath();
	}, [adapter]);

	const getInitialWindowId = useCallback((): T | undefined => {
		const currentPath = adapter.getCurrentPath();
		return pathToIdMap[currentPath];
	}, [adapter, pathToIdMap]);

	return {
		getInitialWindowId,
		getCurrentPath,
	};
}
