import type { CSSProperties, JSX, ReactNode } from "react";
import { useMemo } from "react";
import { useResize } from "../hooks/useResize";
import { useWindow } from "../hooks/useWindow";
import { useWindowManager } from "../hooks/useWindowManager";
import type { ResizeDirection, SizeValue } from "../types";
import {
	ALL_RESIZE_DIRECTIONS,
	getResizeHandleStyle,
} from "../utils/resizeHandleStyles";

export interface ResizeHandlesProps {
	windowId: string;
	thickness?: number;
	cornerSize?: number;
	directions?: ResizeDirection[];
	hideWhenMaximized?: boolean;
	minWidth?: SizeValue;
	minHeight?: SizeValue;
	maxWidth?: SizeValue;
	maxHeight?: SizeValue;
	className?: string;
	directionClassNames?: Partial<Record<ResizeDirection, string>>;
	directionStyles?: Partial<Record<ResizeDirection, CSSProperties>>;
	renderHandle?: (props: {
		direction: ResizeDirection;
		handleProps: ReturnType<ReturnType<typeof useResize>["resizeHandleProps"]>;
		style: CSSProperties;
		className?: string;
	}) => ReactNode;
}

export function ResizeHandles({
	windowId,
	thickness = 4,
	cornerSize = 8,
	directions = ALL_RESIZE_DIRECTIONS,
	hideWhenMaximized = true,
	minWidth = 100,
	minHeight = 50,
	maxWidth,
	maxHeight,
	className,
	directionClassNames,
	directionStyles,
	renderHandle,
}: ResizeHandlesProps): JSX.Element | null {
	const { displayState } = useWindow(windowId);
	const { state, updateWindow } = useWindowManager();

	const win = useMemo(
		() => state.windows.find((w) => w.id === windowId),
		[state.windows, windowId],
	);

	const { resizeHandleProps } = useResize(
		win?.size ?? { width: 400, height: 300 },
		win?.position ?? { x: 100, y: 100 },
		{
			onResize: (size, position) => {
				updateWindow(windowId, { size, position });
			},
			minWidth,
			minHeight,
			maxWidth,
			maxHeight,
		},
	);

	if (hideWhenMaximized && displayState === "maximized") {
		return null;
	}

	return (
		<>
			{directions.map((direction) => {
				const baseStyle = getResizeHandleStyle(
					direction,
					thickness,
					cornerSize,
				);
				const customStyle = directionStyles?.[direction];
				const combinedStyle: CSSProperties = customStyle
					? { ...baseStyle, ...customStyle }
					: baseStyle;

				const handleProps = resizeHandleProps(direction);
				const combinedClassName = [className, directionClassNames?.[direction]]
					.filter(Boolean)
					.join(" ");

				if (renderHandle) {
					return (
						<span key={direction}>
							{renderHandle({
								direction,
								handleProps,
								style: combinedStyle,
								className: combinedClassName || undefined,
							})}
						</span>
					);
				}

				return (
					<div
						key={direction}
						{...handleProps}
						style={combinedStyle}
						className={combinedClassName || undefined}
					/>
				);
			})}
		</>
	);
}
