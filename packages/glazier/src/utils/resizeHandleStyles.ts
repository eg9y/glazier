import type { CSSProperties } from "react";
import type { ResizeDirection } from "../types";

export const RESIZE_CURSORS: Record<ResizeDirection, string> = {
	n: "ns-resize",
	s: "ns-resize",
	e: "ew-resize",
	w: "ew-resize",
	ne: "nesw-resize",
	sw: "nesw-resize",
	nw: "nwse-resize",
	se: "nwse-resize",
};

export function getResizeHandleStyle(
	direction: ResizeDirection,
	thickness = 4,
	cornerSize = 8,
): CSSProperties {
	const base: CSSProperties = {
		position: "absolute",
		touchAction: "none",
		cursor: RESIZE_CURSORS[direction],
	};

	switch (direction) {
		case "n":
			return {
				...base,
				top: 0,
				left: cornerSize,
				right: cornerSize,
				height: thickness,
			};
		case "s":
			return {
				...base,
				bottom: 0,
				left: cornerSize,
				right: cornerSize,
				height: thickness,
			};
		case "e":
			return {
				...base,
				right: 0,
				top: cornerSize,
				bottom: cornerSize,
				width: thickness,
			};
		case "w":
			return {
				...base,
				left: 0,
				top: cornerSize,
				bottom: cornerSize,
				width: thickness,
			};
		case "ne":
			return {
				...base,
				top: 0,
				right: 0,
				width: cornerSize,
				height: cornerSize,
			};
		case "nw":
			return {
				...base,
				top: 0,
				left: 0,
				width: cornerSize,
				height: cornerSize,
			};
		case "se":
			return {
				...base,
				bottom: 0,
				right: 0,
				width: cornerSize,
				height: cornerSize,
			};
		case "sw":
			return {
				...base,
				bottom: 0,
				left: 0,
				width: cornerSize,
				height: cornerSize,
			};
		default:
			return base;
	}
}

export const ALL_RESIZE_DIRECTIONS: ResizeDirection[] = [
	"n",
	"s",
	"e",
	"w",
	"ne",
	"nw",
	"se",
	"sw",
];
