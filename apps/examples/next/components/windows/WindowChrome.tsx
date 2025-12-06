"use client";

import {
	Content,
	ResizeHandles,
	TitleBar,
	Title,
	WindowControls,
	WindowFrame,
} from "glazier";
import { useState, type ReactNode } from "react";

interface WindowChromeProps {
	windowId: string;
	children: ReactNode;
	onSnapZoneChange?: (zone: "left" | "right" | "top" | null) => void;
}

/**
 * Shared window chrome using Glazier's WindowFrame components.
 * This demonstrates the new composable API that reduces boilerplate,
 * with shrink/expand animations on drag.
 */
export function WindowChrome({
	windowId,
	children,
	onSnapZoneChange,
}: WindowChromeProps) {
	const [isDragging, setIsDragging] = useState(false);

	return (
		<div
			className="overflow-hidden rounded-lg border border-slate-600 bg-slate-800 shadow-xl"
			style={{
				transform: isDragging ? "scale(0.98)" : "scale(1)",
				transition: "transform 0.15s ease-out",
				transformOrigin: "center center",
				height: "100%",
			}}
		>
			<WindowFrame
				windowId={windowId}
				enableDoubleClickMaximize={true}
				enableSnapToEdges={true}
				onSnapZoneChange={onSnapZoneChange}
				onDragStart={() => setIsDragging(true)}
				onDragEnd={() => setIsDragging(false)}
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
		</div>
	);
}
