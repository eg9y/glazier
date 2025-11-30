import type React from "react";
import { useCallback, useRef, useState } from "react";
import type { Position, ResizeDirection, Size, SizeValue } from "../types";
import { isNumericSize, resolveSizeValueToPixels } from "../utils/sizeUtils";

export interface UseResizeOptions {
	/** Minimum width constraint. Can be a number (pixels) or CSS string. */
	minWidth?: SizeValue;
	/** Minimum height constraint. Can be a number (pixels) or CSS string. */
	minHeight?: SizeValue;
	/** Maximum width constraint. Can be a number (pixels) or CSS string. */
	maxWidth?: SizeValue;
	/** Maximum height constraint. Can be a number (pixels) or CSS string. */
	maxHeight?: SizeValue;
	/**
	 * Reference element for resolving CSS unit constraints and initial size.
	 * Required if using CSS strings for constraints or if initialSize contains CSS units.
	 */
	constraintRef?: React.RefObject<HTMLElement | null>;
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
		constraintRef,
		onResizeStart,
		onResize,
		onResizeEnd,
	} = options;

	const [isResizing, setIsResizing] = useState(false);
	const isResizingRef = useRef(false);
	const startPos = useRef<Position>({ x: 0, y: 0 });
	// Store resolved pixel sizes for resize calculations
	const startSize = useRef<{ width: number; height: number }>({
		width: 0,
		height: 0,
	});
	const startWindowPos = useRef<Position>(initialPosition);
	const currentDirection = useRef<ResizeDirection>("se");
	// Store resolved constraints for use during resize
	const resolvedConstraints = useRef<{
		minWidth: number;
		minHeight: number;
		maxWidth: number;
		maxHeight: number;
	}>({
		minWidth: 100,
		minHeight: 50,
		maxWidth: Number.POSITIVE_INFINITY,
		maxHeight: Number.POSITIVE_INFINITY,
	});

	const handlePointerDown = useCallback(
		(direction: ResizeDirection) => (e: React.PointerEvent<Element>) => {
			e.currentTarget.setPointerCapture(e.pointerId);
			e.stopPropagation();
			setIsResizing(true);
			isResizingRef.current = true;
			currentDirection.current = direction;
			startPos.current = { x: e.clientX, y: e.clientY };
			startWindowPos.current = initialPosition;

			// Use constraintRef if provided, otherwise try to use the resize handle's parent
			// (typically the window element) as a fallback container for CSS resolution
			const container =
				constraintRef?.current ??
				(e.currentTarget.parentElement as HTMLElement | null);

			// Resolve initial size to pixels
			if (container) {
				startSize.current = {
					width: isNumericSize(initialSize.width)
						? initialSize.width
						: resolveSizeValueToPixels(initialSize.width, container, "width"),
					height: isNumericSize(initialSize.height)
						? initialSize.height
						: resolveSizeValueToPixels(initialSize.height, container, "height"),
				};
				// Resolve constraints
				resolvedConstraints.current = {
					minWidth: isNumericSize(minWidth)
						? minWidth
						: resolveSizeValueToPixels(minWidth, container, "width"),
					minHeight: isNumericSize(minHeight)
						? minHeight
						: resolveSizeValueToPixels(minHeight, container, "height"),
					maxWidth: isNumericSize(maxWidth)
						? maxWidth
						: resolveSizeValueToPixels(maxWidth, container, "width"),
					maxHeight: isNumericSize(maxHeight)
						? maxHeight
						: resolveSizeValueToPixels(maxHeight, container, "height"),
				};
			} else {
				// Fallback: assume numeric values if no container available
				startSize.current = {
					width: isNumericSize(initialSize.width) ? initialSize.width : 0,
					height: isNumericSize(initialSize.height) ? initialSize.height : 0,
				};
				resolvedConstraints.current = {
					minWidth: isNumericSize(minWidth) ? minWidth : 100,
					minHeight: isNumericSize(minHeight) ? minHeight : 50,
					maxWidth: isNumericSize(maxWidth)
						? maxWidth
						: Number.POSITIVE_INFINITY,
					maxHeight: isNumericSize(maxHeight)
						? maxHeight
						: Number.POSITIVE_INFINITY,
				};
			}

			onResizeStart?.();
		},
		[
			initialSize,
			initialPosition,
			minWidth,
			minHeight,
			maxWidth,
			maxHeight,
			constraintRef,
			onResizeStart,
		],
	);

	const handlePointerMove = useCallback(
		(e: React.PointerEvent<Element>) => {
			if (!isResizingRef.current) {
				return;
			}

			const dx = e.clientX - startPos.current.x;
			const dy = e.clientY - startPos.current.y;
			const dir = currentDirection.current;
			const constraints = resolvedConstraints.current;

			let newWidth = startSize.current.width;
			let newHeight = startSize.current.height;
			let newX = startWindowPos.current.x;
			let newY = startWindowPos.current.y;

			// Handle horizontal resize
			if (dir.includes("e")) {
				newWidth = clamp(
					startSize.current.width + dx,
					constraints.minWidth,
					constraints.maxWidth,
				);
			} else if (dir.includes("w")) {
				const proposedWidth = startSize.current.width - dx;
				newWidth = clamp(
					proposedWidth,
					constraints.minWidth,
					constraints.maxWidth,
				);
				// Adjust position when resizing from west
				newX = startWindowPos.current.x + (startSize.current.width - newWidth);
			}

			// Handle vertical resize
			if (dir.includes("s")) {
				newHeight = clamp(
					startSize.current.height + dy,
					constraints.minHeight,
					constraints.maxHeight,
				);
			} else if (dir.includes("n")) {
				const proposedHeight = startSize.current.height - dy;
				newHeight = clamp(
					proposedHeight,
					constraints.minHeight,
					constraints.maxHeight,
				);
				// Adjust position when resizing from north
				newY =
					startWindowPos.current.y + (startSize.current.height - newHeight);
			}

			onResize?.({ width: newWidth, height: newHeight }, { x: newX, y: newY });
		},
		[onResize],
	);

	const handlePointerUp = useCallback(
		(e: React.PointerEvent<Element>) => {
			e.currentTarget.releasePointerCapture(e.pointerId);
			setIsResizing(false);
			isResizingRef.current = false;

			const dx = e.clientX - startPos.current.x;
			const dy = e.clientY - startPos.current.y;
			const dir = currentDirection.current;
			const constraints = resolvedConstraints.current;

			let newWidth = startSize.current.width;
			let newHeight = startSize.current.height;
			let newX = startWindowPos.current.x;
			let newY = startWindowPos.current.y;

			if (dir.includes("e")) {
				newWidth = clamp(
					startSize.current.width + dx,
					constraints.minWidth,
					constraints.maxWidth,
				);
			} else if (dir.includes("w")) {
				const proposedWidth = startSize.current.width - dx;
				newWidth = clamp(
					proposedWidth,
					constraints.minWidth,
					constraints.maxWidth,
				);
				newX = startWindowPos.current.x + (startSize.current.width - newWidth);
			}

			if (dir.includes("s")) {
				newHeight = clamp(
					startSize.current.height + dy,
					constraints.minHeight,
					constraints.maxHeight,
				);
			} else if (dir.includes("n")) {
				const proposedHeight = startSize.current.height - dy;
				newHeight = clamp(
					proposedHeight,
					constraints.minHeight,
					constraints.maxHeight,
				);
				newY =
					startWindowPos.current.y + (startSize.current.height - newHeight);
			}

			onResizeEnd?.(
				{ width: newWidth, height: newHeight },
				{ x: newX, y: newY },
			);
		},
		[onResizeEnd],
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
