"use client";

import { WindowChrome } from "./WindowChrome";

interface HomeWindowProps {
	windowId: string;
	onSnapZoneChange?: (zone: "left" | "right" | null) => void;
}

export function HomeWindow({ windowId, onSnapZoneChange }: HomeWindowProps) {
	return (
		<WindowChrome windowId={windowId} onSnapZoneChange={onSnapZoneChange}>
			<div className="p-6">
				<h1 className="mb-4 font-bold text-2xl text-white">
					Welcome to Glazier
				</h1>
				<p className="mb-4 text-slate-300">
					This is a demo of SEO-friendly routing with Glazier. Each window maps
					to a URL route:
				</p>
				<ul className="mb-4 list-inside list-disc space-y-2 text-slate-400">
					<li>
						<code className="rounded bg-slate-700 px-1 text-slate-200">/</code>{" "}
						&rarr; Home window
					</li>
					<li>
						<code className="rounded bg-slate-700 px-1 text-slate-200">
							/about
						</code>{" "}
						&rarr; About window
					</li>
					<li>
						<code className="rounded bg-slate-700 px-1 text-slate-200">
							/contact
						</code>{" "}
						&rarr; Contact window
					</li>
				</ul>
				<p className="text-slate-400">
					Try clicking on different windows to focus them and watch the URL
					change. Refresh the page to see only the focused window open.
				</p>
				<div className="mt-6 rounded-lg bg-slate-700/50 p-4">
					<h2 className="mb-2 font-semibold text-lg text-white">Features</h2>
					<ul className="list-inside list-disc space-y-1 text-slate-400">
						<li>Drag windows by the title bar</li>
						<li>Double-click title bar to maximize</li>
						<li>Resize from any edge or corner</li>
						<li>Drag to screen edges to snap</li>
						<li>Minimize, maximize, close buttons</li>
					</ul>
				</div>
			</div>
		</WindowChrome>
	);
}
