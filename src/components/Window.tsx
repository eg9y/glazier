import type { CSSProperties, ReactNode } from "react";
import { useWindowManager } from "../hooks/useWindowManager";

export interface WindowProps {
	id: string;
	children: ReactNode;
	className?: string;
	style?: CSSProperties;
}

export function Window({ id, children, className, style }: WindowProps) {
	const { state, bringToFront } = useWindowManager();
	const windowState = state.windows.find((w) => w.id === id);

	if (!windowState) {
		return null;
	}

	const { position, size, zIndex } = windowState;

	const windowStyle: CSSProperties = {
		position: "absolute",
		transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
		width: size.width,
		height: size.height,
		zIndex,
		...style,
	};

	return (
		<div
			style={windowStyle}
			className={className}
			onPointerDown={() => bringToFront(id)}
		>
			{children}
		</div>
	);
}
