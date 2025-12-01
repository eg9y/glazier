"use client";

import type { ReactNode } from "react";
import { WindowChrome } from "./WindowChrome";

interface HomeWindowProps {
	windowId: string;
	onSnapZoneChange?: (zone: "left" | "right" | null) => void;
	children?: ReactNode;
}

/**
 * Home window shell component.
 * Accepts children for server-renderable content.
 */
export function HomeWindow({
	windowId,
	onSnapZoneChange,
	children,
}: HomeWindowProps) {
	return (
		<WindowChrome windowId={windowId} onSnapZoneChange={onSnapZoneChange}>
			{children}
		</WindowChrome>
	);
}
