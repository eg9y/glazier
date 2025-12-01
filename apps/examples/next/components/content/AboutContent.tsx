import type { ReactNode } from "react";

interface AboutContentProps {
	/**
	 * Framework-specific info section (optional)
	 */
	frameworkInfo?: ReactNode;
}

/**
 * Server-renderable content for the About window.
 * This content is visible to search crawlers for SEO.
 */
export function AboutContent({ frameworkInfo }: AboutContentProps) {
	return (
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
				<li>Framework agnostic - works with any React setup</li>
				<li>Snap-to-edges behavior</li>
			</ul>
			{frameworkInfo}
		</div>
	);
}

/**
 * Next.js-specific framework info section
 */
export function NextFrameworkInfo() {
	return (
		<div className="mt-4 rounded-lg bg-slate-700/50 p-4">
			<h3 className="mb-2 font-semibold text-white">Next.js Integration</h3>
			<p className="text-slate-400 text-sm">
				This example uses Next.js App Router with{" "}
				<code className="rounded bg-slate-700 px-1 text-slate-200">
					"use client"
				</code>{" "}
				components. Routes are statically generated using{" "}
				<code className="rounded bg-slate-700 px-1 text-slate-200">
					generateStaticParams()
				</code>
				.
			</p>
		</div>
	);
}
