/**
 * Adapter interface for framework-agnostic routing.
 * Implement this interface to integrate with any routing solution.
 */
export interface RoutingAdapter {
	/** Get the current URL path */
	getCurrentPath(): string;
	/** Navigate to a path (typically using replace semantics) */
	navigate(path: string): void;
	/** Optional: Subscribe to route changes. Returns unsubscribe function. */
	subscribe?(callback: (path: string) => void): () => void;
}
