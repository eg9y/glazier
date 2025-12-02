import type { PointerEvent, RefObject } from "react";
import { createContext, useContext } from "react";
import type { WindowDisplayState } from "../../types";

export interface WindowFrameContextValue {
	/** The window ID */
	windowId: string;
	/** The window title */
	title: string;
	/** Current display state */
	displayState: WindowDisplayState;
	/** Whether this window is focused */
	isFocused: boolean;

	// Actions
	/** Close the window */
	close: () => void;
	/** Minimize the window */
	minimize: () => void;
	/** Maximize the window */
	maximize: () => void;
	/** Restore the window from minimized or maximized state */
	restore: () => void;

	// Drag functionality
	/** Ref to attach to the drag handle element */
	dragHandleRef: RefObject<HTMLElement | null>;
	/** Props to spread on the drag handle element */
	dragHandleProps: {
		onPointerDown: (e: PointerEvent<Element>) => void;
		onPointerMove: (e: PointerEvent<Element>) => void;
		onPointerUp: (e: PointerEvent<Element>) => void;
		style: { touchAction: string };
	};
	/** Active snap zone during drag (if snap-to-edges enabled) */
	activeSnapZone: "left" | "right" | null;
}

export const WindowFrameContext = createContext<WindowFrameContextValue | null>(
	null,
);

/**
 * Hook to access WindowFrame context.
 * Must be used within a WindowFrame component.
 *
 * @example
 * ```tsx
 * function CustomTitleBar() {
 *   const { title, dragHandleRef, dragHandleProps, close } = useWindowFrame();
 *
 *   return (
 *     <div ref={dragHandleRef} {...dragHandleProps}>
 *       <span>{title}</span>
 *       <button onClick={close}>X</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useWindowFrame(): WindowFrameContextValue {
	const context = useContext(WindowFrameContext);
	if (!context) {
		throw new Error("useWindowFrame must be used within a WindowFrame");
	}
	return context;
}
