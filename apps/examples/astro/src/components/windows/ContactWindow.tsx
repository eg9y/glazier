"use client";

import type { ReactNode } from "react";
import { WindowChrome } from "./WindowChrome";

interface ContactWindowProps {
	windowId: string;
	onSnapZoneChange?: (zone: "left" | "right" | null) => void;
	children?: ReactNode;
}

/**
 * Contact window shell component.
 * Accepts children for server-renderable content.
 */
export function ContactWindow({
	windowId,
	onSnapZoneChange,
	children,
}: ContactWindowProps) {
	return (
		<WindowChrome windowId={windowId} onSnapZoneChange={onSnapZoneChange}>
			{children}
		</WindowChrome>
	);
}
