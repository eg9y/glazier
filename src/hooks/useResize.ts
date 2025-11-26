import type React from "react";
import { useCallback, useRef, useState } from "react";
import type { Position, ResizeDirection, Size } from "../types";

export interface UseResizeOptions {
	minWidth?: number;
	minHeight?: number;
	maxWidth?: number;
	maxHeight?: number;
	onResizeStart?: () => void;
	onResize?: (size: Size, position: Position) => void;
	onResizeEnd?: (size: Size, position: Position) => void;
}

export interface UseResizeReturn {
	isResizing: boolean;
	resizeHandleProps: (direction: ResizeDirection) => {
		onPointerDown: (e: React.PointerEvent<Element>) => void;
		onPointerMove: (e: React.PointerEvent<Element>) => void;
		onPointerUp: (e: React.PointerEvent<Element>) => void;
		style: { touchAction: string; cursor: string };
	};
}

const CURSOR_MAP: Record<ResizeDirection, string> = {
	n: "ns-resize",
	s: "ns-resize",
	e: "ew-resize",
	w: "ew-resize",
	ne: "nesw-resize",
	sw: "nesw-resize",
	nw: "nwse-resize",
	se: "nwse-resize",
};

const clamp = (value: number, min: number, max: number) =>
	Math.min(Math.max(value, min), max);

export function useResize(
	initialSize: Size,
	initialPosition: Position,
	options: UseResizeOptions = {},
): UseResizeReturn {
	const {
		minWidth = 100,
		minHeight = 50,
		maxWidth = Number.POSITIVE_INFINITY,
		maxHeight = Number.POSITIVE_INFINITY,
		onResizeStart,
		onResize,
		onResizeEnd,
	} = options;

	const [isResizing, setIsResizing] = useState(false);
	const isResizingRef = useRef(false);
	const startPos = useRef<Position>({ x: 0, y: 0 });
	const startSize = useRef<Size>(initialSize);
	const startWindowPos = useRef<Position>(initialPosition);
	const currentDirection = useRef<ResizeDirection>("se");

	const handlePointerDown = useCallback(
		(direction: ResizeDirection) => (e: React.PointerEvent<Element>) => {
			e.currentTarget.setPointerCapture(e.pointerId);
			e.stopPropagation();
			setIsResizing(true);
			isResizingRef.current = true;
			currentDirection.current = direction;
			startPos.current = { x: e.clientX, y: e.clientY };
			startSize.current = initialSize;
			startWindowPos.current = initialPosition;
			onResizeStart?.();
		},
		[initialSize, initialPosition, onResizeStart],
	);

	const handlePointerMove = useCallback(
		(e: React.PointerEvent<Element>) => {
			if (!isResizingRef.current) {
				return;
			}

			const dx = e.clientX - startPos.current.x;
			const dy = e.clientY - startPos.current.y;
			const dir = currentDirection.current;

			let newWidth = startSize.current.width;
			let newHeight = startSize.current.height;
			let newX = startWindowPos.current.x;
			let newY = startWindowPos.current.y;

			// Handle horizontal resize
			if (dir.includes("e")) {
				newWidth = clamp(startSize.current.width + dx, minWidth, maxWidth);
			} else if (dir.includes("w")) {
				const proposedWidth = startSize.current.width - dx;
				newWidth = clamp(proposedWidth, minWidth, maxWidth);
				// Adjust position when resizing from west
				newX = startWindowPos.current.x + (startSize.current.width - newWidth);
			}

			// Handle vertical resize
			if (dir.includes("s")) {
				newHeight = clamp(startSize.current.height + dy, minHeight, maxHeight);
			} else if (dir.includes("n")) {
				const proposedHeight = startSize.current.height - dy;
				newHeight = clamp(proposedHeight, minHeight, maxHeight);
				// Adjust position when resizing from north
				newY =
					startWindowPos.current.y + (startSize.current.height - newHeight);
			}

			onResize?.({ width: newWidth, height: newHeight }, { x: newX, y: newY });
		},
		[minWidth, minHeight, maxWidth, maxHeight, onResize],
	);

	const handlePointerUp = useCallback(
		(e: React.PointerEvent<Element>) => {
			e.currentTarget.releasePointerCapture(e.pointerId);
			setIsResizing(false);
			isResizingRef.current = false;

			const dx = e.clientX - startPos.current.x;
			const dy = e.clientY - startPos.current.y;
			const dir = currentDirection.current;

			let newWidth = startSize.current.width;
			let newHeight = startSize.current.height;
			let newX = startWindowPos.current.x;
			let newY = startWindowPos.current.y;

			if (dir.includes("e")) {
				newWidth = clamp(startSize.current.width + dx, minWidth, maxWidth);
			} else if (dir.includes("w")) {
				const proposedWidth = startSize.current.width - dx;
				newWidth = clamp(proposedWidth, minWidth, maxWidth);
				newX = startWindowPos.current.x + (startSize.current.width - newWidth);
			}

			if (dir.includes("s")) {
				newHeight = clamp(startSize.current.height + dy, minHeight, maxHeight);
			} else if (dir.includes("n")) {
				const proposedHeight = startSize.current.height - dy;
				newHeight = clamp(proposedHeight, minHeight, maxHeight);
				newY =
					startWindowPos.current.y + (startSize.current.height - newHeight);
			}

			onResizeEnd?.(
				{ width: newWidth, height: newHeight },
				{ x: newX, y: newY },
			);
		},
		[minWidth, minHeight, maxWidth, maxHeight, onResizeEnd],
	);

	const resizeHandleProps = useCallback(
		(direction: ResizeDirection) => ({
			onPointerDown: handlePointerDown(direction),
			onPointerMove: handlePointerMove,
			onPointerUp: handlePointerUp,
			style: {
				touchAction: "none",
				cursor: CURSOR_MAP[direction],
			},
		}),
		[handlePointerDown, handlePointerMove, handlePointerUp],
	);

	return {
		isResizing,
		resizeHandleProps,
	};
}
