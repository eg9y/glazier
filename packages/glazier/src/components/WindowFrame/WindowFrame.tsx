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
	/** Called when window drag starts. Useful for triggering animations. */
	onDragStart?: () => void;
	/** Called when window drag ends. Useful for triggering animations. */
	onDragEnd?: () => void;
}

export function WindowFrame({
	windowId,
	children,
	className,
	style,
	enableDoubleClickMaximize = true,
	enableSnapToEdges = true,
	onSnapZoneChange,
	onDragStart,
	onDragEnd,
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
		onDragStart,
		onDragEnd,
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
