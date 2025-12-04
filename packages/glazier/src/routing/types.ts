export interface RoutingAdapter {
	getCurrentPath(): string;
	navigate(path: string): void;
	subscribe?(callback: (path: string) => void): () => void;
}
