import type { RoutingAdapter } from "../types";

/**
 * Create a routing adapter for browser history API.
 * Uses replaceState to avoid adding history entries on every window focus.
 *
 * @example
 * ```tsx
 * const { onFocusChange } = useWindowRouting({
 *   pathMap: { home: '/', about: '/about' },
 *   adapter: createBrowserAdapter(),
 * });
 * ```
 */
export function createBrowserAdapter(): RoutingAdapter {
	return {
		getCurrentPath() {
			if (typeof window === "undefined") {
				return "/";
			}
			return window.location.pathname;
		},

		navigate(path: string) {
			if (typeof window === "undefined") {
				return;
			}
			if (window.location.pathname !== path) {
				window.history.replaceState(null, "", path);
			}
		},

		subscribe(callback: (path: string) => void) {
			if (typeof window === "undefined") {
				// biome-ignore lint/suspicious/noEmptyBlockStatements: SSR no-op
				return () => {};
			}
			const handler = () => callback(window.location.pathname);
			window.addEventListener("popstate", handler);
			return () => window.removeEventListener("popstate", handler);
		},
	};
}
