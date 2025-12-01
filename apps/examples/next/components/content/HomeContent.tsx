import type { ReactNode } from "react";

interface HomeContentProps {
	/**
	 * Framework badge to display (e.g., "Astro" or "Next.js")
	 */
	frameworkBadge?: ReactNode;
	/**
	 * Framework-specific description paragraph
	 */
	frameworkDescription?: ReactNode;
}

/**
 * Server-renderable content for the Home window.
 * This content is visible to search crawlers for SEO.
 */
export function HomeContent({
	frameworkBadge,
	frameworkDescription,
}: HomeContentProps) {
	return (
		<div className="p-6">
			<div className="mb-4 flex items-center gap-3">
				<h1 className="font-bold text-2xl text-white">Welcome to Glazier</h1>
				{frameworkBadge}
			</div>
			{frameworkDescription && (
				<p className="mb-4 text-slate-300">{frameworkDescription}</p>
			)}
			<p className="mb-4 text-slate-300">
				Each window maps to a URL route for SEO-friendly navigation:
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
	);
}

/**
 * Next.js-specific framework badge
 */
export function NextFrameworkBadge() {
	return (
		<span className="rounded-full bg-black px-3 py-1 font-medium text-sm text-white">
			Next.js
		</span>
	);
}

/**
 * Next.js-specific framework description
 */
export function NextFrameworkDescription() {
	return (
		<>
			This example demonstrates Glazier integrated with{" "}
			<a
				href="https://nextjs.org"
				target="_blank"
				rel="noopener noreferrer"
				className="text-blue-400 underline hover:text-blue-300"
			>
				Next.js
			</a>{" "}
			App Router. The desktop shell is a client component using{" "}
			<code className="rounded bg-slate-700 px-1 text-slate-200">
				"use client"
			</code>
			.
		</>
	);
}
