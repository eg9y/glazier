"use client";

import type { ReactNode } from "react";
import { WindowChrome } from "./WindowChrome";

interface AboutWindowProps {
	windowId: string;
	onSnapZoneChange?: (zone: "left" | "right" | "top" | null) => void;
	children?: ReactNode;
}

/**
 * About window shell component.
 * Accepts children for server-renderable content.
 */
export function AboutWindow({
	windowId,
	onSnapZoneChange,
	children,
}: AboutWindowProps) {
	return (
		<WindowChrome windowId={windowId} onSnapZoneChange={onSnapZoneChange}>
			{children}
		</WindowChrome>
	);
}
