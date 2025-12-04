import type { CSSProperties, JSX, ReactNode } from "react";
import { useWindowFrame } from "./WindowFrameContext";

export interface TitleProps {
	className?: string;
	style?: CSSProperties;
	children?: ReactNode;
}

export function Title({ className, style, children }: TitleProps): JSX.Element {
	const { title } = useWindowFrame();

	return (
		<span className={className} style={style}>
			{children ?? title}
		</span>
	);
}
