export interface Position {
	x: number;
	y: number;
}

export interface Size {
	width: number;
	height: number;
}

export type WindowDisplayState = "normal" | "minimized" | "maximized";

export interface WindowState {
	id: string;
	title: string;
	position: Position;
	size: Size;
	zIndex: number;
	displayState: WindowDisplayState;
	/** Stored position/size before maximize, used for restore */
	previousBounds?: { position: Position; size: Size };
}

export interface WindowManagerState {
	windows: WindowState[];
	activeWindowId: string | null;
}

export type WindowConfig = Omit<
	WindowState,
	"zIndex" | "displayState" | "previousBounds"
> & {
	zIndex?: number;
	displayState?: WindowDisplayState;
};

export type ResizeDirection = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";
