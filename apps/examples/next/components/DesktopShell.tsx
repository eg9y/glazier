"use client";

import {
	createBrowserAdapter,
	createRegistry,
	Desktop,
	DesktopIconGrid,
	SnapPreviewOverlay,
	Taskbar,
	useIconLauncher,
	useWindowManager,
	useWindowRouting,
	WindowManagerProvider,
} from "glazier";
import { AnimatedWindow } from "./AnimatedWindow";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import {
	AboutContent,
	ContactContent,
	HomeContent,
	NextFrameworkBadge,
	NextFrameworkDescription,
	NextFrameworkInfo,
} from "./content";
import { windows, type WindowComponentId } from "../lib/windowConfigs";
import { AboutWindow } from "./windows/AboutWindow";
import { ContactWindow } from "./windows/ContactWindow";
import { HomeWindow } from "./windows/HomeWindow";

/**
 * Type-safe component registry using createRegistry.
 */
const registry = createRegistry(windows.ids, {
	home: HomeWindow,
	about: AboutWindow,
	contact: ContactWindow,
});

// Pre-compute path maps for routing
const pathMap = windows.getPathMap();

const routingAdapter = createBrowserAdapter({
	basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? "",
});

interface DesktopShellProps {
	initialWindowId: string;
}

/**
 * Client-side desktop shell that wraps Glazier components.
 * Uses createBrowserAdapter for URL synchronization.
 */
export function DesktopShell({ initialWindowId }: DesktopShellProps) {
	const containerRef = useRef<HTMLDivElement>(null);

	// Initialize with the window matching the URL
	const initialWindows = [
		windows.has(initialWindowId)
			? windows.getWindowState(initialWindowId as WindowComponentId)
			: windows.getWindowState("home"),
	];

	return (
		<WindowManagerProvider
			defaultWindows={initialWindows}
			defaultIcons={windows.getIconConfigs()}
			initialFocusedWindowId={initialWindowId}
			registry={registry}
			boundsRef={containerRef}
		>
			<DesktopContentWithRouting containerRef={containerRef} />
		</WindowManagerProvider>
	);
}

interface DesktopContentProps {
	containerRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Wrapper component that sets up routing and renders desktop content.
 * Uses useWindowRouting to sync window focus with URL.
 */
function DesktopContentWithRouting({ containerRef }: DesktopContentProps) {
	const { onFocusChange } = useWindowRouting({
		pathMap,
		pathToIdMap: windows.getPathToIdMap(),
		adapter: routingAdapter,
		useComponentId: true,
	});

	const { state } = useWindowManager();

	// Sync URL when active window changes
	useEffect(() => {
		onFocusChange(state.activeWindowId);
	}, [state.activeWindowId, onFocusChange]);

	return <DesktopContent containerRef={containerRef} />;
}

/**
 * Inner desktop content that can use the WindowManager context.
 */
function DesktopContent({ containerRef }: DesktopContentProps) {
	const { deselectAllIcons } = useWindowManager();
	const [snapPreview, setSnapPreview] = useState<"left" | "right" | "top" | null>(null);

	return (
		<div
			ref={containerRef}
			className="relative h-screen w-screen overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900"
			onClick={() => deselectAllIcons()}
		>
			{/* Desktop Icons - now using useIconLauncher */}
			<DesktopIconGrid
				grid={{ cellWidth: 80, cellHeight: 90, gap: 10 }}
				className="pointer-events-none absolute inset-0 p-4"
			>
				{({
					iconState,
					isSelected,
					isDragging,
					wasDragged,
					dragProps,
					onSelect,
				}) => (
					<DesktopIconComponent
						iconId={iconState.id}
						iconState={iconState}
						isSelected={isSelected}
						isDragging={isDragging}
						wasDragged={wasDragged}
						dragProps={dragProps}
						onSelect={onSelect}
					/>
				)}
			</DesktopIconGrid>

			{/* Snap preview overlay */}
			<SnapPreviewOverlay
				zone={snapPreview}
				style={{
					backgroundColor: "rgba(59, 130, 246, 0.3)",
					border: "2px solid rgba(59, 130, 246, 0.6)",
					borderRadius: "0.5rem",
				}}
			/>

			{/* Desktop renders all windows from registry */}
			<Desktop className="pointer-events-none absolute inset-0">
				{({ windowId, component: Component, componentProps, componentId }) => {
					// Cast needed due to React 18 vs 19 types mismatch in registry
					const WindowShell = Component as React.ComponentType<{
						windowId: string;
						onSnapZoneChange: (zone: "left" | "right" | null) => void;
						children?: ReactNode;
					}>;

					// Map componentId to server-renderable content
					const contentMap: Record<string, ReactNode> = {
						home: (
							<HomeContent
								frameworkBadge={<NextFrameworkBadge />}
								frameworkDescription={<NextFrameworkDescription />}
							/>
						),
						about: <AboutContent frameworkInfo={<NextFrameworkInfo />} />,
						contact: <ContactContent />,
					};

					return (
						<AnimatedWindow
							id={windowId}
							className="pointer-events-auto"
						>
							<WindowShell
								windowId={windowId}
								onSnapZoneChange={setSnapPreview}
								{...componentProps}
							>
								{contentMap[componentId]}
							</WindowShell>
						</AnimatedWindow>
					);
				}}
			</Desktop>

			{/* Taskbar at bottom */}
			<Taskbar>
				{({
					windows,
					activeWindowId,
					focusWindow: taskbarFocusWindow,
					restoreWindow,
				}) => (
					<div className="absolute right-0 bottom-0 left-0 z-50 flex h-12 items-center gap-2 bg-slate-900/90 px-4 backdrop-blur">
						{windows.map((win) => (
							<button
								key={win.id}
								type="button"
								onClick={() => {
									if (win.displayState === "minimized") {
										restoreWindow(win.id);
									} else {
										taskbarFocusWindow(win.id);
									}
								}}
								className={`flex items-center gap-2 rounded px-3 py-1.5 text-sm transition-colors ${
									win.id === activeWindowId
										? "bg-white/20 text-white"
										: "text-slate-400 hover:bg-white/10 hover:text-white"
								}`}
							>
								<span>{win.title}</span>
								{win.displayState === "minimized" && (
									<span className="text-slate-500 text-xs">(min)</span>
								)}
							</button>
						))}
					</div>
				)}
			</Taskbar>
		</div>
	);
}

/**
 * Desktop icon component using useIconLauncher hook.
 */
interface DesktopIconComponentProps {
	iconId: string;
	iconState: { id: string; label: string; icon?: string; position: { x: number; y: number }; componentId: string };
	isSelected: boolean;
	isDragging: boolean;
	wasDragged: boolean;
	dragProps: Record<string, unknown>;
	onSelect: () => void;
}

function DesktopIconComponent({
	iconId,
	iconState,
	isSelected,
	isDragging,
	wasDragged,
	dragProps,
	onSelect,
}: DesktopIconComponentProps) {
	// Use the new useIconLauncher hook for open-or-focus logic
	const { launchProps, isWindowOpen } = useIconLauncher({ iconId });

	return (
		<div
			{...(dragProps as React.HTMLAttributes<HTMLDivElement>)}
			{...launchProps}
			onClick={(e) => {
				e.stopPropagation();
				if (!wasDragged) {
					onSelect();
				}
			}}
			style={{
				position: "absolute",
				left: iconState.position.x,
				top: iconState.position.y,
				width: 80,
				cursor: isDragging ? "grabbing" : "pointer",
				opacity: isDragging ? 0.7 : 1,
			}}
			className={`pointer-events-auto flex flex-col items-center gap-1 rounded-lg p-2 transition-colors ${
				isSelected
					? "bg-blue-500/30 ring-1 ring-blue-400"
					: "hover:bg-white/10"
			}`}
		>
			<DesktopIconImage icon={iconState.icon} isActive={isWindowOpen} />
			<span className="w-full truncate text-center text-white text-xs">
				{iconState.label}
			</span>
		</div>
	);
}

/**
 * Simple icon component for desktop icons.
 */
function DesktopIconImage({ icon, isActive }: { icon?: string; isActive?: boolean }) {
	const iconMap: Record<string, React.ReactNode> = {
		home: (
			<svg
				className={`h-10 w-10 ${isActive ? "text-blue-300" : "text-blue-400"}`}
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={1.5}
					d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
				/>
			</svg>
		),
		about: (
			<svg
				className={`h-10 w-10 ${isActive ? "text-green-300" : "text-green-400"}`}
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={1.5}
					d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
				/>
			</svg>
		),
		contact: (
			<svg
				className={`h-10 w-10 ${isActive ? "text-purple-300" : "text-purple-400"}`}
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={1.5}
					d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
				/>
			</svg>
		),
	};

	return (
		<div className={`flex h-12 w-12 items-center justify-center rounded-lg ${isActive ? "bg-slate-600/50" : "bg-slate-700/50"}`}>
			{icon && iconMap[icon] ? (
				iconMap[icon]
			) : (
				<svg
					className="h-10 w-10 text-slate-400"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={1.5}
						d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
					/>
				</svg>
			)}
		</div>
	);
}
