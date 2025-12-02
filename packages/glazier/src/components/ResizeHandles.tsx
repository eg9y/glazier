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
	/** The window ID to attach resize behavior to */
	windowId: string;
	/** Edge handle thickness in pixels (default: 4) */
	thickness?: number;
	/** Corner handle size in pixels (default: 8) */
	cornerSize?: number;
	/** Which handles to render (default: all 8) */
	directions?: ResizeDirection[];
	/** Don't render when maximized (default: true) */
	hideWhenMaximized?: boolean;
	/** Minimum width constraint */
	minWidth?: SizeValue;
	/** Minimum height constraint */
	minHeight?: SizeValue;
	/** Maximum width constraint */
	maxWidth?: SizeValue;
	/** Maximum height constraint */
	maxHeight?: SizeValue;
	/** Base class name applied to all handles */
	className?: string;
	/** Per-direction class names */
	directionClassNames?: Partial<Record<ResizeDirection, string>>;
	/** Per-direction styles (merged with computed styles) */
	directionStyles?: Partial<Record<ResizeDirection, CSSProperties>>;
	/** Custom render function for each handle */
	renderHandle?: (props: {
		direction: ResizeDirection;
		handleProps: ReturnType<ReturnType<typeof useResize>["resizeHandleProps"]>;
		style: CSSProperties;
		className?: string;
	}) => ReactNode;
}

/**
 * Pre-built resize handles component that eliminates boilerplate.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <ResizeHandles windowId={windowId} />
 *
 * // With constraints
 * <ResizeHandles
 *   windowId={windowId}
 *   minWidth={200}
 *   minHeight={150}
 *   maxWidth="80vw"
 * />
 *
 * // Custom styling
 * <ResizeHandles
 *   windowId={windowId}
 *   className="hover:bg-blue-500/20"
 *   directionClassNames={{ se: "bg-blue-500/50" }}
 * />
 *
 * // Custom render
 * <ResizeHandles
 *   windowId={windowId}
 *   renderHandle={({ direction, handleProps, style }) => (
 *     <div {...handleProps} style={style} data-direction={direction} />
 *   )}
 * />
 * ```
 */
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

	// Don't render when maximized
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
