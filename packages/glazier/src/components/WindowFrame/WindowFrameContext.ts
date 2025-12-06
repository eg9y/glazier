import type { PointerEvent, RefObject } from "react";
import { createContext, useContext } from "react";
import type { WindowDisplayState } from "../../types";

export interface WindowFrameContextValue {
	windowId: string;
	title: string;
	displayState: WindowDisplayState;
	isFocused: boolean;
	close: () => void;
	minimize: () => void;
	maximize: () => void;
	restore: () => void;
	dragHandleRef: RefObject<HTMLElement | null>;
	dragHandleProps: {
		onPointerDown: (e: PointerEvent<Element>) => void;
		onPointerMove: (e: PointerEvent<Element>) => void;
		onPointerUp: (e: PointerEvent<Element>) => void;
		style: { touchAction: string };
	};
	activeSnapZone: "left" | "right" | "top" | null;
}

export const WindowFrameContext = createContext<WindowFrameContextValue | null>(
	null,
);

export function useWindowFrame(): WindowFrameContextValue {
	const context = useContext(WindowFrameContext);
	if (!context) {
		throw new Error("useWindowFrame must be used within a WindowFrame");
	}
	return context;
}
