import type { CSSProperties, JSX, ReactNode, RefObject } from "react";
import { useWindowFrame } from "./WindowFrameContext";

export interface TitleBarProps {
	/** Child components (Title, WindowControls, custom content) */
	children?: ReactNode;
	/** Additional class name */
	className?: string;
	/** Additional styles */
	style?: CSSProperties;
}

/**
 * Draggable title bar component.
 * Automatically integrates with WindowFrame context for drag functionality.
 *
 * @example
 * ```tsx
 * <TitleBar className="bg-slate-900 h-10 px-3">
 *   <Title />
 *   <WindowControls />
 * </TitleBar>
 * ```
 *
 * @example
 * ```tsx
 * // With custom content
 * <TitleBar className="flex items-center justify-between p-2">
 *   <div className="flex items-center gap-2">
 *     <Icon />
 *     <Title />
 *   </div>
 *   <WindowControls />
 * </TitleBar>
 * ```
 */
export function TitleBar({
	children,
	className,
	style,
}: TitleBarProps): JSX.Element {
	const { dragHandleRef, dragHandleProps } = useWindowFrame();

	return (
		<div
			ref={dragHandleRef as RefObject<HTMLDivElement>}
			{...dragHandleProps}
			className={className}
			style={{
				display: "flex",
				alignItems: "center",
				justifyContent: "space-between",
				flexShrink: 0,
				...style,
			}}
		>
			{children}
		</div>
	);
}
