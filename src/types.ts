export interface Position {
	x: number;
	y: number;
}

export interface Size {
	width: number;
	height: number;
}

export interface WindowState {
	id: string;
	title: string;
	position: Position;
	size: Size;
	zIndex: number;
}

export interface WindowManagerState {
	windows: WindowState[];
	activeWindowId: string | null;
}

export type WindowConfig = Omit<WindowState, "zIndex"> & { zIndex?: number };
