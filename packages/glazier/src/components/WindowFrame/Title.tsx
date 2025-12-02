import type { CSSProperties, JSX, ReactNode } from "react";
import { useWindowFrame } from "./WindowFrameContext";

export interface TitleProps {
	/** Additional class name */
	className?: string;
	/** Additional styles */
	style?: CSSProperties;
	/** Custom content to render instead of the window title */
	children?: ReactNode;
}

/**
 * Renders the window title from WindowFrame context.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <Title className="text-white font-medium" />
 *
 * // With custom content
 * <Title>
 *   <Icon /> My Custom Title
 * </Title>
 * ```
 */
export function Title({ className, style, children }: TitleProps): JSX.Element {
	const { title } = useWindowFrame();

	return (
		<span className={className} style={style}>
			{children ?? title}
		</span>
	);
}
