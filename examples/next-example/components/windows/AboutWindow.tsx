"use client";

import { WindowChrome } from "./WindowChrome";

interface AboutWindowProps {
	windowId: string;
	onSnapZoneChange?: (zone: "left" | "right" | null) => void;
}

export function AboutWindow({ windowId, onSnapZoneChange }: AboutWindowProps) {
	return (
		<WindowChrome windowId={windowId} onSnapZoneChange={onSnapZoneChange}>
			<div className="p-6">
				<h1 className="mb-4 font-bold text-2xl text-white">About Glazier</h1>
				<p className="mb-4 text-slate-300">
					Glazier is a headless window management library for React. It provides
					the building blocks for creating desktop-like UIs with draggable,
					resizable windows.
				</p>
				<h2 className="mb-2 font-semibold text-lg text-white">Features</h2>
				<ul className="mb-4 list-inside list-disc space-y-2 text-slate-400">
					<li>Draggable and resizable windows</li>
					<li>Window stacking with z-index management</li>
					<li>Minimize, maximize, and restore states</li>
					<li>Taskbar component for window navigation</li>
					<li>Component registry for serializable state</li>
					<li>SSR-friendly with Next.js support</li>
					<li>Snap-to-edges behavior</li>
				</ul>
				<p className="text-slate-400">
					This example demonstrates how to integrate Glazier with Next.js App
					Router for SEO-friendly routing.
				</p>
			</div>
		</WindowChrome>
	);
}
