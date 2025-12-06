import type { CSSProperties, JSX, ReactNode } from "react";
import { useMemo, useRef } from "react";
import { useWindow } from "../../hooks/useWindow";
import { useWindowDrag } from "../../hooks/useWindowDrag";
import { useWindowManager } from "../../hooks/useWindowManager";
import {
	WindowFrameContext,
	type WindowFrameContextValue,
} from "./WindowFrameContext";

export interface WindowFrameProps {
	windowId: string;
	children: ReactNode;
	className?: string;
	style?: CSSProperties;
	enableDoubleClickMaximize?: boolean;
	enableSnapToEdges?: boolean;
	onSnapZoneChange?: (zone: "left" | "right" | "top" | null) => void;
}

export function WindowFrame({
	windowId,
	children,
	className,
	style,
	enableDoubleClickMaximize = true,
	enableSnapToEdges = true,
	onSnapZoneChange,
}: WindowFrameProps): JSX.Element {
	const { title, close, minimize, maximize, restore, displayState } =
		useWindow(windowId);
	const { state } = useWindowManager();

	const isFocused = state.activeWindowId === windowId;

	const dragHandleRef = useRef<HTMLElement>(null);
	const { dragHandleProps, activeSnapZone } = useWindowDrag({
		windowId,
		dragHandleRef,
		enableDoubleClickMaximize,
		enableSnapToEdges,
		onSnapZoneEnter: (zone) => onSnapZoneChange?.(zone),
		onSnapZoneLeave: () => onSnapZoneChange?.(null),
	});

	const contextValue: WindowFrameContextValue = useMemo(
		() => ({
			windowId,
			title,
			displayState,
			isFocused,
			close,
			minimize,
			maximize,
			restore,
			dragHandleRef,
			dragHandleProps,
			activeSnapZone,
		}),
		[
			windowId,
			title,
			displayState,
			isFocused,
			close,
			minimize,
			maximize,
			restore,
			dragHandleProps,
			activeSnapZone,
		],
	);

	return (
		<WindowFrameContext.Provider value={contextValue}>
			<div
				className={className}
				style={{
					display: "flex",
					flexDirection: "column",
					height: "100%",
					...style,
				}}
			>
				{children}
			</div>
		</WindowFrameContext.Provider>
	);
}
