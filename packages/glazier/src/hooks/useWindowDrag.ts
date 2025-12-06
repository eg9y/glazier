import type React from "react";
import type { RefObject } from "react";
import { useCallback, useRef, useState } from "react";
import type { ContainerBounds } from "../context/WindowManagerContext";
import type { Position, WindowState } from "../types";
import { isNumericSize, resolveSizeValueToPixels } from "../utils/sizeUtils";
import { useDrag } from "./useDrag";
import { useWindowManager } from "./useWindowManager";

export type SnapZone = "left" | "right" | "top";

export interface UseWindowDragOptions {
	windowId: string;
	dragHandleRef: RefObject<HTMLElement | null>;
	/** Disable the automatic maximized drag-to-restore behavior. Default: false */
	disableMaximizedDragRestore?: boolean;
	/** Enable double-click on drag handle to toggle maximize. Default: false */
	enableDoubleClickMaximize?: boolean;
	/** Enable snap-to-edges behavior. Default: false */
	enableSnapToEdges?: boolean;
	/** Called when entering a snap zone during drag */
	onSnapZoneEnter?: (zone: SnapZone) => void;
	/** Called when leaving a snap zone during drag */
	onSnapZoneLeave?: () => void;
	/** Called when drag starts. Useful for triggering animations. */
	onDragStart?: () => void;
	/** Called when drag ends. Useful for triggering animations. */
	onDragEnd?: () => void;
}

export interface UseWindowDragReturn {
	isDragging: boolean;
	/** The currently active snap zone, or null if not in a snap zone */
	activeSnapZone: SnapZone | null;
	dragHandleProps: {
		onPointerDown: (e: React.PointerEvent<Element>) => void;
		onPointerMove: (e: React.PointerEvent<Element>) => void;
		onPointerUp: (e: React.PointerEvent<Element>) => void;
		style: { touchAction: string };
	};
}

const DOUBLE_CLICK_THRESHOLD = 300; // milliseconds
const SNAP_EDGE_THRESHOLD = 50; // pixels from edge

/** Detect which snap zone the cursor is in based on position */
function detectSnapZone(
	cursorX: number,
	cursorY: number,
	containerWidth: number,
): SnapZone | null {
	// Top edge takes priority for maximize
	if (cursorY <= SNAP_EDGE_THRESHOLD) {
		return "top";
	}
	if (cursorX <= SNAP_EDGE_THRESHOLD) {
		return "left";
	}
	if (cursorX >= containerWidth - SNAP_EDGE_THRESHOLD) {
		return "right";
	}
	return null;
}

/** Calculate restored position when dragging a maximized window */
function calculateRestoredPosition(
	position: Position,
	win: WindowState,
	dragHandle: HTMLElement,
	containerRect: DOMRect | undefined,
	container: HTMLElement | null,
): { position: Position; size: { width: number; height: number } } {
	const handleRect = dragHandle.getBoundingClientRect();
	const cursorPercent = (position.x - handleRect.left) / handleRect.width;

	// Resolve size to pixels (previousBounds or current size may have CSS units)
	const sizeSource = win.previousBounds?.size ?? win.size;
	let restoredWidth: number;
	let restoredHeight: number;

	if (container) {
		restoredWidth = isNumericSize(sizeSource.width)
			? sizeSource.width
			: resolveSizeValueToPixels(sizeSource.width, container, "width");
		restoredHeight = isNumericSize(sizeSource.height)
			? sizeSource.height
			: resolveSizeValueToPixels(sizeSource.height, container, "height");
	} else {
		// Fallback to numeric values or defaults
		restoredWidth = isNumericSize(sizeSource.width) ? sizeSource.width : 400;
		restoredHeight = isNumericSize(sizeSource.height) ? sizeSource.height : 300;
	}

	const newX =
		position.x - (containerRect?.left ?? 0) - restoredWidth * cursorPercent;
	const newY =
		position.y - (containerRect?.top ?? 0) - dragHandle.offsetHeight / 2;

	return {
		position: { x: newX, y: newY },
		size: { width: restoredWidth, height: restoredHeight },
	};
}

/** Calculate snap position and size for a given snap zone */
function calculateSnapBounds(
	snapZone: SnapZone,
	containerBounds: ContainerBounds,
):
	| { position: Position; size: { width: number; height: number } }
	| "maximize" {
	if (snapZone === "top") {
		// Top edge triggers maximize
		return "maximize";
	}
	const halfWidth = containerBounds.width / 2;
	return {
		position: snapZone === "left" ? { x: 0, y: 0 } : { x: halfWidth, y: 0 },
		size: { width: halfWidth, height: containerBounds.height },
	};
}

export function useWindowDrag({
	windowId,
	dragHandleRef,
	disableMaximizedDragRestore = false,
	enableDoubleClickMaximize = false,
	enableSnapToEdges = false,
	onSnapZoneEnter,
	onSnapZoneLeave,
	onDragStart,
	onDragEnd,
}: UseWindowDragOptions): UseWindowDragReturn {
	const {
		state,
		updateWindow,
		getContainerBounds,
		boundsRef,
		maximizeWindow,
		restoreWindow,
	} = useWindowManager();
	const win = state.windows.find((w) => w.id === windowId);

	// Track if we just restored from maximized to avoid double-moving
	const justRestoredRef = useRef(false);

	// Cache resolved window size during drag for performance
	const resolvedWindowSizeRef = useRef<{
		width: number;
		height: number;
	} | null>(null);

	// Double-click detection
	const lastClickTimeRef = useRef<number>(0);

	// Snap zone state
	const [activeSnapZone, setActiveSnapZone] = useState<SnapZone | null>(null);
	const previousSnapZoneRef = useRef<SnapZone | null>(null);
	// Track if snap action occurred to skip bounds constraint
	const didSnapRef = useRef(false);

	// Handle maximized window drag-to-restore
	const handleMaximizedDrag = useCallback(
		(position: Position): boolean => {
			if (
				!win ||
				win.displayState !== "maximized" ||
				disableMaximizedDragRestore
			) {
				return false;
			}

			const dragHandle = dragHandleRef.current;
			if (!dragHandle) {
				return false;
			}

			const containerRect = boundsRef?.current?.getBoundingClientRect();
			const restored = calculateRestoredPosition(
				position,
				win,
				dragHandle,
				containerRect,
				boundsRef?.current ?? null,
			);

			updateWindow(windowId, {
				displayState: "normal",
				position: restored.position,
				size: restored.size,
				previousBounds: undefined,
			});

			justRestoredRef.current = true;
			return true;
		},
		[
			win,
			disableMaximizedDragRestore,
			dragHandleRef,
			boundsRef,
			updateWindow,
			windowId,
		],
	);

	// Handle snap zone detection during drag
	const handleSnapZoneDetection = useCallback(
		(position: Position) => {
			if (!(enableSnapToEdges && win) || win.displayState === "maximized") {
				return;
			}

			const containerBounds = getContainerBounds();
			const containerEl = boundsRef?.current;
			if (!(containerBounds && containerEl)) {
				return;
			}

			const containerRect = containerEl.getBoundingClientRect();
			const cursorX = position.x - containerRect.left;
			const cursorY = position.y - containerRect.top;
			const newZone = detectSnapZone(cursorX, cursorY, containerBounds.width);

			if (newZone !== previousSnapZoneRef.current) {
				if (newZone) {
					onSnapZoneEnter?.(newZone);
				} else {
					onSnapZoneLeave?.();
				}
				previousSnapZoneRef.current = newZone;
				setActiveSnapZone(newZone);
			}
		},
		[
			enableSnapToEdges,
			win,
			getContainerBounds,
			boundsRef,
			onSnapZoneEnter,
			onSnapZoneLeave,
		],
	);

	// Resolve and cache window size for bounds constraint calculations
	const cacheResolvedWindowSize = useCallback(() => {
		if (!win) {
			resolvedWindowSizeRef.current = null;
			return;
		}
		const container = boundsRef?.current;
		if (container) {
			resolvedWindowSizeRef.current = {
				width: isNumericSize(win.size.width)
					? win.size.width
					: resolveSizeValueToPixels(win.size.width, container, "width"),
				height: isNumericSize(win.size.height)
					? win.size.height
					: resolveSizeValueToPixels(win.size.height, container, "height"),
			};
		} else if (
			isNumericSize(win.size.width) &&
			isNumericSize(win.size.height)
		) {
			resolvedWindowSizeRef.current = {
				width: win.size.width,
				height: win.size.height,
			};
		} else {
			resolvedWindowSizeRef.current = null;
		}
	}, [win, boundsRef]);

	const { isDragging, dragHandleProps } = useDrag({
		onDragStart: () => {
			// Resolve and cache window size at drag start for performance
			// (avoids creating/removing DOM elements on every pointer move)
			cacheResolvedWindowSize();
			onDragStart?.();
		},
		onDrag: (position: Position, delta: Position) => {
			if (!win) {
				return;
			}

			// Handle maximized drag-to-restore
			if (handleMaximizedDrag(position)) {
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

			// Snap zone detection
			handleSnapZoneDetection(position);
		},
		onDragEnd: () => {
			// Reset snap flag
			didSnapRef.current = false;

			// Handle snap action - use ref to get current value (state would be stale)
			const snapZone = previousSnapZoneRef.current;
			if (enableSnapToEdges && snapZone && win) {
				const containerBounds = getContainerBounds();
				if (containerBounds) {
					const snapBounds = calculateSnapBounds(snapZone, containerBounds);

					if (snapBounds === "maximize") {
						// Top edge triggers maximize
						maximizeWindow(windowId);
					} else {
						updateWindow(windowId, {
							position: snapBounds.position,
							size: snapBounds.size,
							previousBounds:
								win.displayState === "normal"
									? { position: win.position, size: win.size }
									: win.previousBounds,
						});
					}

					// Mark that snap occurred so bounds constraint is skipped
					didSnapRef.current = true;
				}
			}

			// Clear snap zone state
			setActiveSnapZone(null);
			previousSnapZoneRef.current = null;
			onSnapZoneLeave?.();
			onDragEnd?.();
		},
		getBoundsConstraint: () => {
			// Skip bounds constraint if a snap action occurred (snap sets its own position)
			if (didSnapRef.current) {
				return null;
			}

			if (!win || win.displayState === "maximized") {
				return null;
			}

			const containerBounds = getContainerBounds();
			// Use cached resolved size (set in onDragStart) for performance
			if (!(containerBounds && resolvedWindowSizeRef.current)) {
				return null;
			}

			return {
				container: containerBounds,
				windowSize: resolvedWindowSizeRef.current,
				windowPosition: win.position,
			};
		},
		onConstrainToBounds: (correctedPosition: Position) => {
			updateWindow(windowId, {
				position: correctedPosition,
			});
		},
	});

	// Wrap onPointerDown to handle double-click
	const handlePointerDown = useCallback(
		(e: React.PointerEvent<Element>) => {
			if (enableDoubleClickMaximize && win) {
				const now = Date.now();
				if (now - lastClickTimeRef.current < DOUBLE_CLICK_THRESHOLD) {
					// Double-click detected - toggle maximize
					if (win.displayState === "maximized") {
						restoreWindow(windowId);
					} else if (win.displayState === "normal") {
						maximizeWindow(windowId);
					}
					lastClickTimeRef.current = 0;
					return; // Don't start drag
				}
				lastClickTimeRef.current = now;
			}

			// Call original onPointerDown
			dragHandleProps.onPointerDown(e);
		},
		[
			enableDoubleClickMaximize,
			win,
			windowId,
			maximizeWindow,
			restoreWindow,
			dragHandleProps,
		],
	);

	return {
		isDragging,
		activeSnapZone,
		dragHandleProps: {
			...dragHandleProps,
			onPointerDown: handlePointerDown,
		},
	};
}
