import type { CSSProperties, JSX, ReactNode } from "react";

export interface ContentProps {
	children: ReactNode;
	className?: string;
	style?: CSSProperties;
}

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
