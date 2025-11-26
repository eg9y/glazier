let counter = 0;

export function generateWindowId(): string {
	return `window-${++counter}`;
}
