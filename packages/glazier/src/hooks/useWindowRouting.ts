import { useCallback, useEffect, useMemo, useRef } from "react";
import { createBrowserAdapter } from "../routing/adapters/browser";
import type { RoutingAdapter } from "../routing/types";
import { useWindowManager } from "./useWindowManager";

export interface UseWindowRoutingOptions<T extends string = string> {
	pathMap: Partial<Record<T, string>>;
	pathToIdMap?: Record<string, T>;
	adapter?: RoutingAdapter;
	/** Use componentId instead of windowId for path lookup (default: true) */
	useComponentId?: boolean;
}

export interface UseWindowRoutingReturn<T extends string = string> {
	onFocusChange: (windowId: string | null) => void;
	getInitialWindowId: () => T | undefined;
	getCurrentPath: () => string;
}

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

	const lastPathRef = useRef<string | null>(null);

	const onFocusChange = useCallback(
		(windowId: string | null) => {
			if (!windowId) {
				return;
			}

			const win = state.windows.find((w) => w.id === windowId);
			if (!win) {
				return;
			}

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
