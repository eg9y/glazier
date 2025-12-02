import { useCallback, useEffect, useMemo, useRef } from "react";
import { createBrowserAdapter } from "../routing/adapters/browser";
import type { RoutingAdapter } from "../routing/types";
import { useWindowManager } from "./useWindowManager";

export interface UseWindowRoutingOptions<T extends string = string> {
	/**
	 * Mapping of window identifiers to URL paths.
	 * Can use either windowId or componentId depending on useComponentId option.
	 */
	pathMap: Partial<Record<T, string>>;
	/**
	 * Reverse mapping of paths to window identifiers.
	 * If not provided, will be computed from pathMap.
	 */
	pathToIdMap?: Record<string, T>;
	/**
	 * Routing adapter (defaults to browser history adapter).
	 */
	adapter?: RoutingAdapter;
	/**
	 * Use componentId instead of windowId for path lookup (default: true).
	 * When true, looks up the focused window's componentId in pathMap.
	 * When false, looks up the focused window's id in pathMap.
	 */
	useComponentId?: boolean;
}

export interface UseWindowRoutingReturn<T extends string = string> {
	/**
	 * Handler to pass to WindowManagerProvider's onFocusChange.
	 * Updates URL when focused window changes.
	 */
	onFocusChange: (windowId: string | null) => void;
	/**
	 * Get the initial window ID from the current URL path.
	 * Useful for determining which window to open on initial load.
	 */
	getInitialWindowId: () => T | undefined;
	/**
	 * Get the current path from the routing adapter.
	 */
	getCurrentPath: () => string;
}

/**
 * Hook for syncing window focus with URL routing.
 *
 * @example
 * ```tsx
 * // Basic usage with browser history
 * const { onFocusChange, getInitialWindowId } = useWindowRouting({
 *   pathMap: { home: '/', about: '/about', contact: '/contact' },
 * });
 *
 * return (
 *   <WindowManagerProvider
 *     defaultWindows={[windows.getWindowState(getInitialWindowId() ?? 'home')]}
 *     onFocusChange={onFocusChange}
 *   >
 *     {children}
 *   </WindowManagerProvider>
 * );
 * ```
 *
 * @example
 * ```tsx
 * // Using with defineWindows
 * const windows = defineWindows({ ... });
 *
 * const { onFocusChange, getInitialWindowId } = useWindowRouting({
 *   pathMap: windows.getPathMap(),
 *   pathToIdMap: windows.getPathToIdMap(),
 * });
 * ```
 */
export function useWindowRouting<T extends string = string>(
	options: UseWindowRoutingOptions<T>,
): UseWindowRoutingReturn<T> {
	const {
		pathMap,
		pathToIdMap: providedPathToIdMap,
		adapter = createBrowserAdapter(),
		useComponentId = true,
	} = options;

	const { state } = useWindowManager();

	// Compute reverse mapping if not provided
	const pathToIdMap = useMemo(() => {
		if (providedPathToIdMap) {
			return providedPathToIdMap;
		}
		const reverse: Record<string, T> = {};
		for (const [id, path] of Object.entries(pathMap)) {
			if (path !== undefined) {
				reverse[path as string] = id as T;
			}
		}
		return reverse;
	}, [pathMap, providedPathToIdMap]);

	// Track previous path to avoid unnecessary updates
	const lastPathRef = useRef<string | null>(null);

	const onFocusChange = useCallback(
		(windowId: string | null) => {
			if (!windowId) {
				return;
			}

			// Find the window to get its componentId if needed
			const win = state.windows.find((w) => w.id === windowId);
			if (!win) {
				return;
			}

			// Determine the key to look up in pathMap
			const lookupKey = useComponentId ? win.componentId : windowId;
			if (!lookupKey) {
				return;
			}

			const path = pathMap[lookupKey as T];
			if (path && path !== lastPathRef.current) {
				lastPathRef.current = path;
				adapter.navigate(path);
			}
		},
		[state.windows, pathMap, adapter, useComponentId],
	);

	const getCurrentPath = useCallback(() => {
		return adapter.getCurrentPath();
	}, [adapter]);

	const getInitialWindowId = useCallback((): T | undefined => {
		const currentPath = adapter.getCurrentPath();
		return pathToIdMap[currentPath];
	}, [adapter, pathToIdMap]);

	// Optionally subscribe to route changes
	useEffect(() => {
		if (!adapter.subscribe) {
			return;
		}

		return adapter.subscribe((path) => {
			lastPathRef.current = path;
		});
	}, [adapter]);

	return {
		onFocusChange,
		getInitialWindowId,
		getCurrentPath,
	};
}
