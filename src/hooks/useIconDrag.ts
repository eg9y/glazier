import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { GridConfig, Position } from "../types";
import { snapToGrid } from "../utils/gridSnap";
import { useWindowManager } from "./useWindowManager";

export interface UseIconDragOptions {
	/** The icon ID to drag */
	iconId: string;
	/** Grid configuration for snapping */
	gridConfig?: GridConfig;
	/** Whether to snap only on drop (true) or continuously during drag (false). Defaults to true. */
	snapOnDrop?: boolean;
	/** Called when drag starts */
	onDragStart?: (position: Position) => void;
	/** Called during drag with the current position */
	onDrag?: (position: Position) => void;
	/** Called when drag ends with the final position */
	onDragEnd?: (position: Position) => void;
}

export interface UseIconDragReturn {
	/** Whether the icon is currently being dragged */
	isDragging: boolean;
	/** Whether the icon was dragged (moved) in the last interaction. Use this to prevent click handlers from firing after a drag. */
	wasDragged: boolean;
	/** Props to spread on the draggable element */
	dragHandleProps: {
		onPointerDown: (e: React.PointerEvent<Element>) => void;
		onPointerMove: (e: React.PointerEvent<Element>) => void;
		onPointerUp: (e: React.PointerEvent<Element>) => void;
		style: { touchAction: string };
	};
}

/**
 * Hook to enable dragging for a desktop icon with optional grid snapping.
 */
export function useIconDrag(options: UseIconDragOptions): UseIconDragReturn {
	const {
		iconId,
		gridConfig,
		snapOnDrop = true,
		onDragStart,
		onDrag,
		onDragEnd,
	} = options;

	const { icons, updateIcon } = useWindowManager();
	const [isDragging, setIsDragging] = useState(false);
	const [wasDragged, setWasDragged] = useState(false);
	const startPointer = useRef<Position>({ x: 0, y: 0 });
	const startIconPosition = useRef<Position>({ x: 0, y: 0 });
	const hasMoved = useRef(false);
	const pointerCaptured = useRef(false);
	const activePointerId = useRef<number | null>(null);
	const activeElement = useRef<Element | null>(null);

	// Global cleanup for interrupted drags (context menu, focus loss, etc.)
	useEffect(() => {
		if (!isDragging) {
			return;
		}

		const cleanup = () => {
			setIsDragging(false);
			setWasDragged(hasMoved.current);
			pointerCaptured.current = false;
			activePointerId.current = null;
			activeElement.current = null;
		};

		// Handle pointer up anywhere on document
		document.addEventListener("pointerup", cleanup);
		// Handle context menu (right-click) which interrupts drag
		document.addEventListener("contextmenu", cleanup);
		// Handle window blur (focus lost)
		window.addEventListener("blur", cleanup);

		return () => {
			document.removeEventListener("pointerup", cleanup);
			document.removeEventListener("contextmenu", cleanup);
			window.removeEventListener("blur", cleanup);
		};
	}, [isDragging]);

	const handlePointerDown = useCallback(
		(e: React.PointerEvent<Element>) => {
			// Don't start drag if the event originated from an interactive element
			// (but allow role="button" divs since icons use those for accessibility)
			const target = e.target as HTMLElement;
			if (
				target instanceof HTMLElement &&
				(target.closest("button") ||
					target.closest("a") ||
					target.closest("input") ||
					target.closest("select") ||
					target.closest("textarea"))
			) {
				return;
			}

			const icon = icons.find((i) => i.id === iconId);
			if (!icon) {
				return;
			}

			// Don't capture pointer immediately - wait until actual movement
			// This allows click/double-click events to fire normally
			setIsDragging(true);
			setWasDragged(false);
			hasMoved.current = false;
			pointerCaptured.current = false;
			activePointerId.current = e.pointerId;
			activeElement.current = e.currentTarget;
			startPointer.current = { x: e.clientX, y: e.clientY };
			startIconPosition.current = { ...icon.position };
			onDragStart?.(icon.position);
		},
		[icons, iconId, onDragStart],
	);

	const handlePointerMove = useCallback(
		(e: React.PointerEvent<Element>) => {
			if (!isDragging) {
				return;
			}

			const deltaX = e.clientX - startPointer.current.x;
			const deltaY = e.clientY - startPointer.current.y;

			// Check if pointer has moved enough to consider it a drag (threshold of 8px)
			if (!hasMoved.current && (Math.abs(deltaX) > 8 || Math.abs(deltaY) > 8)) {
				hasMoved.current = true;
				// Capture pointer only once actual movement is detected
				// This allows click/double-click events to fire normally for stationary clicks
				if (
					!pointerCaptured.current &&
					activeElement.current &&
					activePointerId.current !== null
				) {
					activeElement.current.setPointerCapture(activePointerId.current);
					pointerCaptured.current = true;
				}
			}

			// Only update position if we've moved past the threshold
			if (!hasMoved.current) {
				return;
			}

			let newPosition: Position = {
				x: startIconPosition.current.x + deltaX,
				y: startIconPosition.current.y + deltaY,
			};

			// Apply grid snapping during drag if configured and not snap-on-drop
			if (gridConfig && !snapOnDrop) {
				newPosition = snapToGrid(newPosition, gridConfig);
			}

			updateIcon(iconId, { position: newPosition });
			onDrag?.(newPosition);
		},
		[isDragging, iconId, updateIcon, gridConfig, snapOnDrop, onDrag],
	);

	const handlePointerUp = useCallback(
		(e: React.PointerEvent<Element>) => {
			if (!isDragging) {
				return;
			}

			// Only release pointer capture if it was captured
			if (pointerCaptured.current && activePointerId.current !== null) {
				try {
					e.currentTarget.releasePointerCapture(activePointerId.current);
				} catch {
					// Ignore if pointer capture was already released
				}
			}

			setIsDragging(false);
			setWasDragged(hasMoved.current);
			pointerCaptured.current = false;
			activePointerId.current = null;
			activeElement.current = null;

			const icon = icons.find((i) => i.id === iconId);
			if (!icon) {
				return;
			}

			let finalPosition = icon.position;

			// Apply grid snapping on drop if configured and actual movement occurred
			if (gridConfig && snapOnDrop && hasMoved.current) {
				finalPosition = snapToGrid(icon.position, gridConfig);
				updateIcon(iconId, { position: finalPosition });
			}

			onDragEnd?.(finalPosition);
		},
		[isDragging, icons, iconId, gridConfig, snapOnDrop, updateIcon, onDragEnd],
	);

	return {
		isDragging,
		wasDragged,
		dragHandleProps: {
			onPointerDown: handlePointerDown,
			onPointerMove: handlePointerMove,
			onPointerUp: handlePointerUp,
			style: { touchAction: "none" },
		},
	};
}
