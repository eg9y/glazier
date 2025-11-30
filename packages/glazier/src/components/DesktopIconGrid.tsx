import type React from "react";
import type { CSSProperties, ReactNode } from "react";
import { useWindowManager } from "../hooks/useWindowManager";
import type { GridConfig, IconState, Position } from "../types";
import { pixelToGrid } from "../utils/gridSnap";
import { DesktopIcon } from "./DesktopIcon";

export interface DesktopIconGridRenderProps {
	/** The icon ID */
	iconId: string;
	/** The icon state */
	iconState: IconState;
	/** Grid position (row, column) */
	gridPosition: { row: number; column: number };
	/** Computed pixel position based on grid */
	pixelPosition: Position;
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
	/** Whether a window with this icon's componentId is currently open */
	isWindowOpen: boolean;
	/** Opens the window if not open, or focuses/restores it if already open */
	openOrFocus: () => void;
}

export interface DesktopIconGridProps {
	/** Grid configuration */
	grid: GridConfig;
	/** Whether to enable grid snapping on drop (default: true) */
	snapToGrid?: boolean;
	/** Render function for each icon */
	children: (props: DesktopIconGridRenderProps) => ReactNode;
	/** Optional className for the grid container */
	className?: string;
	/** Optional style for the grid container */
	style?: CSSProperties;
}

/**
 * Headless grid container for desktop icons.
 * Iterates over all icons and provides grid-aware render props.
 */
export function DesktopIconGrid({
	grid,
	snapToGrid: snapEnabled = true,
	children,
	className,
	style,
}: DesktopIconGridProps) {
	const {
		icons,
		selectedIconIds,
		isWindowOpen,
		getWindowByComponentId,
		focusWindow,
		restoreWindow,
		launchIcon,
	} = useWindowManager();

	return (
		<div className={className} style={style}>
			{icons.map((iconState) => {
				const gridPosition = pixelToGrid(iconState.position, grid);
				const windowOpen = isWindowOpen(iconState.componentId);

				// Create a handler that opens or focuses the window for this icon
				const handleOpenOrFocus = () => {
					const existingWindow = getWindowByComponentId(iconState.componentId);
					if (existingWindow) {
						if (existingWindow.displayState === "minimized") {
							restoreWindow(existingWindow.id);
						} else {
							focusWindow(existingWindow.id);
						}
					} else {
						// Use launchIcon which respects defaultWindowConfigs
						launchIcon(iconState.id);
					}
				};

				return (
					<DesktopIcon
						key={iconState.id}
						id={iconState.id}
						gridConfig={snapEnabled ? grid : undefined}
						snapOnDrop={snapEnabled}
					>
						{({ isDragging, wasDragged, dragProps, onSelect, onLaunch }) =>
							children({
								iconId: iconState.id,
								iconState,
								gridPosition,
								pixelPosition: iconState.position,
								isSelected: selectedIconIds.includes(iconState.id),
								isDragging,
								wasDragged,
								dragProps,
								onSelect,
								onLaunch,
								isWindowOpen: windowOpen,
								openOrFocus: handleOpenOrFocus,
							})
						}
					</DesktopIcon>
				);
			})}
		</div>
	);
}
