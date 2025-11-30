"use client";

import {
	type ResizeDirection,
	useResize,
	useWindow,
	useWindowDrag,
	useWindowManager,
} from "glazier";
import { type ReactNode, useRef } from "react";

interface WindowChromeProps {
	windowId: string;
	children: ReactNode;
	onSnapZoneChange?: (zone: "left" | "right" | null) => void;
}

/**
 * Shared window chrome with title bar, resize handles, and controls.
 */
export function WindowChrome({
	windowId,
	children,
	onSnapZoneChange,
}: WindowChromeProps) {
	const { title, close, minimize, maximize, displayState, restore } =
		useWindow(windowId);
	const { state, updateWindow } = useWindowManager();
	const win = state.windows.find((w) => w.id === windowId);

	const dragHandleRef = useRef<HTMLDivElement>(null);
	const { dragHandleProps, activeSnapZone } = useWindowDrag({
		windowId,
		dragHandleRef,
		enableDoubleClickMaximize: true,
		enableSnapToEdges: true,
		onSnapZoneEnter: (zone) => onSnapZoneChange?.(zone),
		onSnapZoneLeave: () => onSnapZoneChange?.(null),
	});

	// Resize hook
	const { resizeHandleProps } = useResize(
		win?.size ?? { width: 400, height: 300 },
		win?.position ?? { x: 100, y: 100 },
		{
			onResize: (size, position) => {
				updateWindow(windowId, { size, position });
			},
			minWidth: 300,
			minHeight: 200,
		},
	);

	const isMaximized = displayState === "maximized";

	return (
		<div className="flex h-full flex-col">
			{/* Title bar */}
			<div
				ref={dragHandleRef}
				{...dragHandleProps}
				className="flex h-10 shrink-0 cursor-move items-center justify-between border-slate-700 border-b bg-slate-900 px-3"
			>
				<span className="font-medium text-sm text-white">{title}</span>
				<div className="flex gap-1" onPointerDown={(e) => e.stopPropagation()}>
					<button
						type="button"
						onClick={minimize}
						className="rounded p-1 text-slate-400 hover:bg-slate-700 hover:text-white"
					>
						<MinimizeIcon />
					</button>
					<button
						type="button"
						onClick={() => {
							if (isMaximized) {
								restore();
							} else {
								maximize();
							}
						}}
						className="rounded p-1 text-slate-400 hover:bg-slate-700 hover:text-white"
					>
						{isMaximized ? <RestoreIcon /> : <MaximizeIcon />}
					</button>
					<button
						type="button"
						onClick={close}
						className="rounded p-1 text-slate-400 hover:bg-red-600 hover:text-white"
					>
						<CloseIcon />
					</button>
				</div>
			</div>

			{/* Content */}
			<div className="relative flex-1 overflow-auto">{children}</div>

			{/* Resize handles (only when not maximized) */}
			{!isMaximized &&
				(["n", "s", "e", "w", "ne", "nw", "se", "sw"] as ResizeDirection[]).map(
					(direction) => (
						<div
							key={direction}
							{...resizeHandleProps(direction)}
							style={getResizeHandleStyle(direction)}
						/>
					),
				)}
		</div>
	);
}

function getResizeHandleStyle(direction: ResizeDirection): React.CSSProperties {
	const base: React.CSSProperties = { position: "absolute" };
	const handleSize = 8;

	switch (direction) {
		case "n":
			return {
				...base,
				top: 0,
				left: handleSize,
				right: handleSize,
				height: 4,
			};
		case "s":
			return {
				...base,
				bottom: 0,
				left: handleSize,
				right: handleSize,
				height: 4,
			};
		case "e":
			return {
				...base,
				right: 0,
				top: handleSize,
				bottom: handleSize,
				width: 4,
			};
		case "w":
			return {
				...base,
				left: 0,
				top: handleSize,
				bottom: handleSize,
				width: 4,
			};
		case "ne":
			return {
				...base,
				top: 0,
				right: 0,
				width: handleSize,
				height: handleSize,
			};
		case "nw":
			return {
				...base,
				top: 0,
				left: 0,
				width: handleSize,
				height: handleSize,
			};
		case "se":
			return {
				...base,
				bottom: 0,
				right: 0,
				width: handleSize,
				height: handleSize,
			};
		case "sw":
			return {
				...base,
				bottom: 0,
				left: 0,
				width: handleSize,
				height: handleSize,
			};
		default:
			return base;
	}
}

function MinimizeIcon() {
	return (
		<svg
			className="h-4 w-4"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M20 12H4"
			/>
		</svg>
	);
}

function MaximizeIcon() {
	return (
		<svg
			className="h-4 w-4"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
		>
			<rect x="4" y="4" width="16" height="16" strokeWidth={2} rx="1" />
		</svg>
	);
}

function RestoreIcon() {
	return (
		<svg
			className="h-4 w-4"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M8 4h12v12"
			/>
			<rect x="4" y="8" width="12" height="12" strokeWidth={2} rx="1" />
		</svg>
	);
}

function CloseIcon() {
	return (
		<svg
			className="h-4 w-4"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M6 18L18 6M6 6l12 12"
			/>
		</svg>
	);
}
