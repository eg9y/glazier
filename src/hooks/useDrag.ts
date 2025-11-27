import type React from "react";
import { useCallback, useRef, useState } from "react";
import type { ContainerBounds } from "../context/WindowManagerContext";
import type { Position, Size } from "../types";

export type { ContainerBounds };

export interface UseDragOptions {
	onDragStart?: (position: Position) => void;
	onDrag?: (position: Position, delta: Position) => void;
	onDragEnd?: (position: Position) => void;
	/**
	 * If provided, the window will be repositioned back into bounds when drag ends.
	 * Should return the current container bounds and window size/position.
	 */
	getBoundsConstraint?: () => {
		container: ContainerBounds;
		windowSize: Size;
		windowPosition: Position;
	} | null;
	/**
	 * Called when the window position needs to be corrected to stay within bounds.
	 * Only called if getBoundsConstraint is provided and the window is out of bounds.
	 */
	onConstrainToBounds?: (correctedPosition: Position) => void;
}

export interface UseDragReturn {
	isDragging: boolean;
	dragHandleProps: {
		onPointerDown: (e: React.PointerEvent<Element>) => void;
		onPointerMove: (e: React.PointerEvent<Element>) => void;
		onPointerUp: (e: React.PointerEvent<Element>) => void;
		style: { touchAction: string };
	};
}

export function constrainPositionToBounds(
	position: Position,
	windowSize: Size,
	container: ContainerBounds,
): Position {
	let { x, y } = position;

	// Constrain left edge
	if (x < 0) {
		x = 0;
	}
	// Constrain right edge
	if (x + windowSize.width > container.width) {
		x = container.width - windowSize.width;
	}
	// Constrain top edge
	if (y < 0) {
		y = 0;
	}
	// Constrain bottom edge
	if (y + windowSize.height > container.height) {
		y = container.height - windowSize.height;
	}

	// Handle case where window is larger than container
	if (windowSize.width > container.width) {
		x = 0;
	}
	if (windowSize.height > container.height) {
		y = 0;
	}

	return { x, y };
}

export function useDrag(options: UseDragOptions = {}): UseDragReturn {
	const {
		onDragStart,
		onDrag,
		onDragEnd,
		getBoundsConstraint,
		onConstrainToBounds,
	} = options;
	const [isDragging, setIsDragging] = useState(false);
	const startPos = useRef<Position>({ x: 0, y: 0 });
	const lastPos = useRef<Position>({ x: 0, y: 0 });

	const handlePointerDown = useCallback(
		(e: React.PointerEvent<Element>) => {
			// Don't start drag if the event originated from an interactive element
			const target = e.target as HTMLElement;
			if (
				target instanceof HTMLElement &&
				(target.closest("button") ||
					target.closest("a") ||
					target.closest("input") ||
					target.closest("select") ||
					target.closest("textarea") ||
					target.closest('[role="button"]'))
			) {
				return;
			}
			e.currentTarget.setPointerCapture(e.pointerId);
			setIsDragging(true);
			const pos = { x: e.clientX, y: e.clientY };
			startPos.current = pos;
			lastPos.current = pos;
			onDragStart?.(pos);
		},
		[onDragStart],
	);

	const handlePointerMove = useCallback(
		(e: React.PointerEvent<Element>) => {
			if (!isDragging) {
				return;
			}
			const currentPos = { x: e.clientX, y: e.clientY };
			const delta = {
				x: currentPos.x - lastPos.current.x,
				y: currentPos.y - lastPos.current.y,
			};
			lastPos.current = currentPos;
			onDrag?.(currentPos, delta);
		},
		[isDragging, onDrag],
	);

	const handlePointerUp = useCallback(
		(e: React.PointerEvent<Element>) => {
			e.currentTarget.releasePointerCapture(e.pointerId);
			setIsDragging(false);
			const pos = { x: e.clientX, y: e.clientY };
			onDragEnd?.(pos);

			// Check bounds constraint and reposition if needed
			if (getBoundsConstraint && onConstrainToBounds) {
				const constraint = getBoundsConstraint();
				if (constraint) {
					const { container, windowSize, windowPosition } = constraint;
					const correctedPosition = constrainPositionToBounds(
						windowPosition,
						windowSize,
						container,
					);
					// Only call if position changed
					if (
						correctedPosition.x !== windowPosition.x ||
						correctedPosition.y !== windowPosition.y
					) {
						onConstrainToBounds(correctedPosition);
					}
				}
			}
		},
		[onDragEnd, getBoundsConstraint, onConstrainToBounds],
	);

	return {
		isDragging,
		dragHandleProps: {
			onPointerDown: handlePointerDown,
			onPointerMove: handlePointerMove,
			onPointerUp: handlePointerUp,
			style: { touchAction: "none" },
		},
	};
}
