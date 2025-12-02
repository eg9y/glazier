"use client";

import {
	Content,
	ResizeHandles,
	TitleBar,
	Title,
	WindowControls,
	WindowFrame,
} from "glazier";
import type { ReactNode } from "react";

interface WindowChromeProps {
	windowId: string;
	children: ReactNode;
	onSnapZoneChange?: (zone: "left" | "right" | null) => void;
}

/**
 * Shared window chrome using Glazier's WindowFrame components.
 * This demonstrates the new composable API that reduces boilerplate.
 */
export function WindowChrome({
	windowId,
	children,
	onSnapZoneChange,
}: WindowChromeProps) {
	return (
		<WindowFrame
			windowId={windowId}
			enableDoubleClickMaximize={true}
			enableSnapToEdges={true}
			onSnapZoneChange={onSnapZoneChange}
		>
			{/* Title bar with drag support */}
			<TitleBar className="flex h-10 shrink-0 cursor-move items-center justify-between border-slate-700 border-b bg-slate-900 px-3">
				<Title className="font-medium text-sm text-white" />
				<WindowControls
					className="flex gap-1"
					buttonClassName="rounded p-1 text-slate-400 hover:bg-slate-700 hover:text-white"
					closeButtonClassName="hover:bg-red-600"
				/>
			</TitleBar>

			{/* Content area */}
			{/* @ts-expect-error React 18/19 ReactNode type mismatch */}
			<Content className="relative flex-1 overflow-auto">{children}</Content>

			{/* Resize handles */}
			<ResizeHandles windowId={windowId} minWidth={300} minHeight={200} />
		</WindowFrame>
	);
}
