import type React from "react";
import type { ReactNode } from "react";
import { useDesktopIcon } from "../hooks/useDesktopIcon";
import { useIconDrag } from "../hooks/useIconDrag";
import type { GridConfig, IconState } from "../types";

export interface DesktopIconRenderProps {
	/** The icon ID */
	iconId: string;
	/** The icon state */
	iconState: IconState;
	/** Whether this icon is selected */
	isSelected: boolean;
	/** Whether this icon is being dragged */
	isDragging: boolean;
	/** Whether the icon was dragged (moved) in the last interaction. Use this to prevent click handlers from firing after a drag. */
	wasDragged: boolean;
	/** Props to spread on the icon container for drag functionality */
	dragProps: {
		onPointerDown: (e: React.PointerEvent<Element>) => void;
		onPointerMove: (e: React.PointerEvent<Element>) => void;
		onPointerUp: (e: React.PointerEvent<Element>) => void;
		style: { touchAction: string };
	};
	/** Handler for selecting the icon */
	onSelect: (multiSelect?: boolean) => void;
	/** Handler for launching the icon (opening its window) */
	onLaunch: () => void;
}

export interface DesktopIconProps {
	/** Icon ID to render */
	id: string;
	/** Render function for custom icon appearance */
	children: (props: DesktopIconRenderProps) => ReactNode;
	/** Optional grid configuration for snap-to-grid during drag */
	gridConfig?: GridConfig;
	/** Whether to snap only on drop (default: true) or continuously during drag */
	snapOnDrop?: boolean;
}

/**
 * Headless desktop icon component with render props pattern.
 * Provides all the state and handlers needed to render a draggable, selectable icon.
 */
export function DesktopIcon({
	id,
	children,
	gridConfig,
	snapOnDrop = true,
}: DesktopIconProps) {
	const { iconState, isSelected, select, launch } = useDesktopIcon(id);
	const { isDragging, wasDragged, dragHandleProps } = useIconDrag({
		iconId: id,
		gridConfig,
		snapOnDrop,
	});

	const renderProps: DesktopIconRenderProps = {
		iconId: id,
		iconState,
		isSelected,
		isDragging,
		wasDragged,
		dragProps: dragHandleProps,
		onSelect: select,
		onLaunch: launch,
	};

	// Return children directly - the consumer controls the wrapper element
	return <>{children(renderProps)}</>;
}
