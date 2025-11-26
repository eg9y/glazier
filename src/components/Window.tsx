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

	const { position, size, zIndex, displayState } = windowState;

	// Don't render minimized windows
	if (displayState === "minimized") {
		return null;
	}

	const isMaximized = displayState === "maximized";

	const windowStyle: CSSProperties = {
		position: "absolute",
		transform: isMaximized
			? "none"
			: `translate3d(${position.x}px, ${position.y}px, 0)`,
		width: isMaximized ? "100%" : size.width,
		height: isMaximized ? "100%" : size.height,
		top: isMaximized ? 0 : undefined,
		left: isMaximized ? 0 : undefined,
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
