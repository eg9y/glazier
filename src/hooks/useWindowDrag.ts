import type React from "react";
import type { RefObject } from "react";
import { useRef } from "react";
import type { Position } from "../types";
import { useDrag } from "./useDrag";
import { useWindowManager } from "./useWindowManager";

export interface UseWindowDragOptions {
	windowId: string;
	dragHandleRef: RefObject<HTMLElement | null>;
	/** Disable the automatic maximized drag-to-restore behavior. Default: false */
	disableMaximizedDragRestore?: boolean;
}

export interface UseWindowDragReturn {
	isDragging: boolean;
	dragHandleProps: {
		onPointerDown: (e: React.PointerEvent<Element>) => void;
		onPointerMove: (e: React.PointerEvent<Element>) => void;
		onPointerUp: (e: React.PointerEvent<Element>) => void;
		style: { touchAction: string };
	};
}

export function useWindowDrag({
	windowId,
	dragHandleRef,
	disableMaximizedDragRestore = false,
}: UseWindowDragOptions): UseWindowDragReturn {
	const { state, updateWindow, getContainerBounds, boundsRef } =
		useWindowManager();
	const win = state.windows.find((w) => w.id === windowId);

	// Track if we just restored from maximized to avoid double-moving
	const justRestoredRef = useRef(false);

	const { isDragging, dragHandleProps } = useDrag({
		onDrag: (position: Position, delta: Position) => {
			if (!win) {
				return;
			}

			// Handle maximized drag-to-restore
			if (win.displayState === "maximized" && !disableMaximizedDragRestore) {
				const dragHandle = dragHandleRef.current;
				if (!dragHandle) {
					return;
				}

				const containerEl = boundsRef?.current;
				const containerRect = containerEl?.getBoundingClientRect();

				// Calculate cursor percentage within the drag handle
				const handleRect = dragHandle.getBoundingClientRect();
				const cursorPercent = (position.x - handleRect.left) / handleRect.width;

				// Get restored window size (from previousBounds or current size)
				const restoredWidth = win.previousBounds?.size.width ?? win.size.width;
				const restoredHeight =
					win.previousBounds?.size.height ?? win.size.height;

				// Calculate new position based on cursor percentage
				const newX =
					position.x -
					(containerRect?.left ?? 0) -
					restoredWidth * cursorPercent;
				const newY =
					position.y - (containerRect?.top ?? 0) - dragHandle.offsetHeight / 2;

				updateWindow(windowId, {
					displayState: "normal",
					position: { x: newX, y: newY },
					size: { width: restoredWidth, height: restoredHeight },
					previousBounds: undefined,
				});

				justRestoredRef.current = true;
				return;
			}

			// Skip normal drag update if we just restored (position already set)
			if (justRestoredRef.current) {
				justRestoredRef.current = false;
				return;
			}

			// Normal drag behavior
			updateWindow(windowId, {
				position: {
					x: win.position.x + delta.x,
					y: win.position.y + delta.y,
				},
			});
		},
		getBoundsConstraint: () => {
			if (!win || win.displayState === "maximized") {
				return null;
			}

			const containerBounds = getContainerBounds();
			if (!containerBounds) {
				return null;
			}

			return {
				container: containerBounds,
				windowSize: win.size,
				windowPosition: win.position,
			};
		},
		onConstrainToBounds: (correctedPosition: Position) => {
			updateWindow(windowId, {
				position: correctedPosition,
			});
		},
	});

	return {
		isDragging,
		dragHandleProps,
	};
}
