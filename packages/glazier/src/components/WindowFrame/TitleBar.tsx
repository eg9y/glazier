import type { CSSProperties, JSX, ReactNode, RefObject } from "react";
import { useWindowFrame } from "./WindowFrameContext";

export interface TitleBarProps {
	children?: ReactNode;
	className?: string;
	style?: CSSProperties;
}

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
