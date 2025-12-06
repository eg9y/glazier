import type { RoutingAdapter } from "../types";

export interface BrowserAdapterOptions {
	basePath?: string;
}

export function createBrowserAdapter(
	options?: BrowserAdapterOptions,
): RoutingAdapter {
	const basePath = options?.basePath ?? "";

	return {
		getCurrentPath() {
			if (typeof window === "undefined") {
				return "/";
			}
			const pathname = window.location.pathname;
			if (basePath && pathname.startsWith(basePath)) {
				return pathname.slice(basePath.length) || "/";
			}
			return pathname;
		},

		navigate(path: string) {
			if (typeof window === "undefined") {
				return;
			}
			const fullPath = basePath + path;
			if (window.location.pathname !== fullPath) {
				window.history.replaceState(null, "", fullPath);
			}
		},

		subscribe(callback: (path: string) => void) {
			if (typeof window === "undefined") {
				// biome-ignore lint/suspicious/noEmptyBlockStatements: SSR no-op
				return () => {};
			}
			const handler = () => {
				const pathname = window.location.pathname;
				if (basePath && pathname.startsWith(basePath)) {
					callback(pathname.slice(basePath.length) || "/");
				} else {
					callback(pathname);
				}
			};
			window.addEventListener("popstate", handler);
			return () => window.removeEventListener("popstate", handler);
		},
	};
}
