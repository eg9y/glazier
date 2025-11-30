import type { GridConfig, Position } from "../types";

/**
 * Snaps a position to the nearest grid cell.
 */
export function snapToGrid(position: Position, config: GridConfig): Position {
	const { cellWidth, cellHeight, gap = 0 } = config;
	const cellTotalWidth = cellWidth + gap;
	const cellTotalHeight = cellHeight + gap;

	const col = Math.round(position.x / cellTotalWidth);
	const row = Math.round(position.y / cellTotalHeight);

	return {
		x: col * cellTotalWidth,
		y: row * cellTotalHeight,
	};
}

/**
 * Converts a grid position (row, column) to pixel position.
 */
export function gridToPixel(
	row: number,
	column: number,
	config: GridConfig,
): Position {
	const { cellWidth, cellHeight, gap = 0 } = config;
	const cellTotalWidth = cellWidth + gap;
	const cellTotalHeight = cellHeight + gap;

	return {
		x: column * cellTotalWidth,
		y: row * cellTotalHeight,
	};
}

/**
 * Converts pixel position to grid position (row, column).
 */
export function pixelToGrid(
	position: Position,
	config: GridConfig,
): { row: number; column: number } {
	const { cellWidth, cellHeight, gap = 0 } = config;
	const cellTotalWidth = cellWidth + gap;
	const cellTotalHeight = cellHeight + gap;

	return {
		column: Math.round(position.x / cellTotalWidth),
		row: Math.round(position.y / cellTotalHeight),
	};
}
