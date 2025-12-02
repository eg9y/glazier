import type { CSSProperties, JSX, ReactNode } from "react";

export interface ContentProps {
	/** Content to render */
	children: ReactNode;
	/** Additional class name */
	className?: string;
	/** Additional styles */
	style?: CSSProperties;
}

/**
 * Content area wrapper for window body.
 * Provides flex-grow and overflow handling by default.
 *
 * @example
 * ```tsx
 * <Content className="p-4">
 *   {children}
 * </Content>
 *
 * // With custom overflow
 * <Content className="overflow-hidden">
 *   <ScrollArea>{children}</ScrollArea>
 * </Content>
 * ```
 */
export function Content({
	children,
	className,
	style,
}: ContentProps): JSX.Element {
	return (
		<div
			className={className}
			style={{
				flex: 1,
				position: "relative",
				overflow: "auto",
				...style,
			}}
		>
			{children}
		</div>
	);
}
