import type React from "react";
import { useCallback, useRef, useState } from "react";
import type { Position } from "../types";

export interface UseDragOptions {
	onDragStart?: (position: Position) => void;
	onDrag?: (position: Position, delta: Position) => void;
	onDragEnd?: (position: Position) => void;
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

export function useDrag(options: UseDragOptions = {}): UseDragReturn {
	const { onDragStart, onDrag, onDragEnd } = options;
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
		},
		[onDragEnd],
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
