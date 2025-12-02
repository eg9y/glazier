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
	/** The window ID */
	windowId: string;
	/** Child components (TitleBar, Content, ResizeHandles, etc.) */
	children: ReactNode;
	/** Additional class name */
	className?: string;
	/** Additional styles */
	style?: CSSProperties;
	/** Enable double-click on title bar to maximize (default: true) */
	enableDoubleClickMaximize?: boolean;
	/** Enable snap-to-edges when dragging (default: true) */
	enableSnapToEdges?: boolean;
	/** Callback when snap zone changes */
	onSnapZoneChange?: (zone: "left" | "right" | null) => void;
}

/**
 * Container component that provides WindowFrame context to children.
 * Use with TitleBar, Content, and ResizeHandles for a complete window.
 *
 * @example
 * ```tsx
 * <WindowFrame windowId={windowId}>
 *   <TitleBar className="bg-slate-900 h-10">
 *     <Title />
 *     <WindowControls />
 *   </TitleBar>
 *   <Content className="flex-1 overflow-auto">
 *     {children}
 *   </Content>
 *   <ResizeHandles windowId={windowId} />
 * </WindowFrame>
 * ```
 *
 * @example
 * ```tsx
 * // Fully custom using context
 * <WindowFrame windowId={windowId}>
 *   <CustomWindowContent />
 * </WindowFrame>
 *
 * function CustomWindowContent() {
 *   const { title, close, dragHandleRef, dragHandleProps } = useWindowFrame();
 *   return (
 *     <div>
 *       <div ref={dragHandleRef} {...dragHandleProps}>{title}</div>
 *       <button onClick={close}>Close</button>
 *     </div>
 *   );
 * }
 * ```
 */
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
