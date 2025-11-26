import { useCallback, useContext } from "react";
import { WindowManagerContext } from "../context/WindowManagerContext";
import type { WindowDisplayState } from "../types";

export interface UseWindowReturn {
	id: string;
	title: string;
	displayState: WindowDisplayState;
	isFocused: boolean;
	close: () => void;
	minimize: () => void;
	maximize: () => void;
	restore: () => void;
}

export function useWindow(windowId: string): UseWindowReturn {
	const context = useContext(WindowManagerContext);
	if (!context) {
		throw new Error("useWindow must be used within a WindowManagerProvider");
	}

	const { state, closeWindow, minimizeWindow, maximizeWindow, restoreWindow } =
		context;

	const windowState = state.windows.find((w) => w.id === windowId);
	if (!windowState) {
		throw new Error(`Window with id "${windowId}" not found`);
	}

	const close = useCallback(
		() => closeWindow(windowId),
		[closeWindow, windowId],
	);
	const minimize = useCallback(
		() => minimizeWindow(windowId),
		[minimizeWindow, windowId],
	);
	const maximize = useCallback(
		() => maximizeWindow(windowId),
		[maximizeWindow, windowId],
	);
	const restore = useCallback(
		() => restoreWindow(windowId),
		[restoreWindow, windowId],
	);

	return {
		id: windowState.id,
		title: windowState.title,
		displayState: windowState.displayState,
		isFocused: state.activeWindowId === windowId,
		close,
		minimize,
		maximize,
		restore,
	};
}
