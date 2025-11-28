import type { Meta, StoryFn } from "@storybook/react";
import type { ReactNode } from "react";
import { useRef, useState } from "react";
import {
	Desktop,
	SnapPreviewOverlay,
	Taskbar,
	Window,
	WindowManagerProvider,
	useResize,
	useWindowDrag,
	useWindowManager,
} from "..";
import type { SnapZone, WindowRegistry, WindowState } from "..";

export default {
	title: "WindowManager",
} as Meta;

function TitleBar({
	windowId,
	title,
	onClose,
	onMinimize,
	onMaximize,
	onSnapZoneEnter,
	onSnapZoneLeave,
}: {
	windowId: string;
	title: string;
	onClose: () => void;
	onMinimize?: () => void;
	onMaximize?: () => void;
	onSnapZoneEnter?: (zone: SnapZone) => void;
	onSnapZoneLeave?: () => void;
}) {
	const { state } = useWindowManager();
	const win = state.windows.find((w) => w.id === windowId);

	const titleBarRef = useRef<HTMLDivElement>(null);

	const { isDragging, dragHandleProps } = useWindowDrag({
		windowId,
		dragHandleRef: titleBarRef,
		enableDoubleClickMaximize: true,
		enableSnapToEdges: true,
		onSnapZoneEnter,
		onSnapZoneLeave,
	});

	return (
		<div
			ref={titleBarRef}
			{...dragHandleProps}
			style={{
				padding: "8px 12px",
				background: isDragging ? "#444" : "#333",
				color: "white",
				cursor:
					win?.displayState === "maximized"
						? "default"
						: isDragging
							? "grabbing"
							: "grab",
				display: "flex",
				justifyContent: "space-between",
				alignItems: "center",
				userSelect: "none",
			}}
		>
			<span>{title}</span>
			<div style={{ display: "flex", gap: "8px" }}>
				{onMinimize && (
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							onMinimize();
						}}
						style={{
							background: "transparent",
							border: "none",
							color: "white",
							cursor: "pointer",
							fontSize: "14px",
						}}
					>
						_
					</button>
				)}
				{onMaximize && (
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							onMaximize();
						}}
						style={{
							background: "transparent",
							border: "none",
							color: "white",
							cursor: "pointer",
							fontSize: "14px",
						}}
					>
						□
					</button>
				)}
				<button
					type="button"
					onClick={(e) => {
						e.stopPropagation();
						onClose();
					}}
					style={{
						background: "transparent",
						border: "none",
						color: "white",
						cursor: "pointer",
						fontSize: "16px",
					}}
				>
					×
				</button>
			</div>
		</div>
	);
}

function ResizableWindow({
	windowId,
	onSnapZoneEnter,
	onSnapZoneLeave,
}: {
	windowId: string;
	onSnapZoneEnter?: (zone: SnapZone) => void;
	onSnapZoneLeave?: () => void;
}) {
	const {
		state,
		updateWindow,
		closeWindow,
		minimizeWindow,
		maximizeWindow,
		restoreWindow,
	} = useWindowManager();
	const win = state.windows.find((w) => w.id === windowId);

	const { resizeHandleProps } = useResize(
		win?.size ?? { width: 200, height: 100 },
		win?.position ?? { x: 0, y: 0 },
		{
			minWidth: 200,
			minHeight: 150,
			onResize: (size, position) => {
				updateWindow(windowId, { size, position });
			},
		},
	);

	if (!win) {
		return null;
	}

	const isMaximized = win.displayState === "maximized";

	return (
		<Window
			id={windowId}
			style={{
				background: "white",
				border: "1px solid #ccc",
				borderRadius: isMaximized ? 0 : "4px",
				boxShadow: isMaximized ? "none" : "0 4px 12px rgba(0,0,0,0.15)",
				overflow: "hidden",
				display: "flex",
				flexDirection: "column",
			}}
		>
			<TitleBar
				windowId={windowId}
				title={win.title}
				onClose={() => closeWindow(windowId)}
				onMinimize={() => minimizeWindow(windowId)}
				onMaximize={() =>
					isMaximized ? restoreWindow(windowId) : maximizeWindow(windowId)
				}
				onSnapZoneEnter={onSnapZoneEnter}
				onSnapZoneLeave={onSnapZoneLeave}
			/>
			<div style={{ padding: "16px", flex: 1 }}>
				Window content for {win.title}
				<br />
				<small style={{ color: "#666" }}>
					State: {win.displayState} | Size: {win.size.width}x{win.size.height}
				</small>
			</div>
			{!isMaximized && (
				<>
					<div
						{...resizeHandleProps("e")}
						style={{
							...resizeHandleProps("e").style,
							position: "absolute",
							right: 0,
							top: 0,
							bottom: 0,
							width: "4px",
						}}
					/>
					<div
						{...resizeHandleProps("s")}
						style={{
							...resizeHandleProps("s").style,
							position: "absolute",
							bottom: 0,
							left: 0,
							right: 0,
							height: "4px",
						}}
					/>
					<div
						{...resizeHandleProps("se")}
						style={{
							...resizeHandleProps("se").style,
							position: "absolute",
							bottom: 0,
							right: 0,
							width: "12px",
							height: "12px",
						}}
					/>
				</>
			)}
		</Window>
	);
}

function WindowList({
	onSnapZoneEnter,
	onSnapZoneLeave,
}: {
	onSnapZoneEnter?: (zone: SnapZone) => void;
	onSnapZoneLeave?: () => void;
}) {
	const { state } = useWindowManager();

	return (
		<>
			{state.windows.map((win) => (
				<ResizableWindow
					key={win.id}
					windowId={win.id}
					onSnapZoneEnter={onSnapZoneEnter}
					onSnapZoneLeave={onSnapZoneLeave}
				/>
			))}
		</>
	);
}

function LaunchButtons() {
	const { openWindow } = useWindowManager();

	return (
		<div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
			<button
				type="button"
				onClick={() =>
					openWindow({
						id: `window-${Date.now()}`,
						title: "New Window",
						position: {
							x: 50 + Math.random() * 100,
							y: 50 + Math.random() * 100,
						},
						size: { width: 300, height: 200 },
					})
				}
			>
				Open Window
			</button>
		</div>
	);
}

function SimpleTaskbar() {
	return (
		<Taskbar>
			{({
				windows,
				activeWindowId,
				focusWindow,
				minimizeWindow,
				restoreWindow,
			}) => (
				<div
					style={{
						position: "absolute",
						bottom: 0,
						left: 0,
						right: 0,
						height: "40px",
						background: "#222",
						display: "flex",
						alignItems: "center",
						padding: "0 8px",
						gap: "4px",
					}}
				>
					{windows.map((w) => (
						<button
							key={w.id}
							type="button"
							onClick={() => {
								if (w.displayState === "minimized") {
									restoreWindow(w.id);
								} else if (w.id === activeWindowId) {
									minimizeWindow(w.id);
								} else {
									focusWindow(w.id);
								}
							}}
							style={{
								padding: "6px 12px",
								background: w.id === activeWindowId ? "#444" : "#333",
								color: "white",
								border: "none",
								borderRadius: "4px",
								cursor: "pointer",
								opacity: w.displayState === "minimized" ? 0.6 : 1,
							}}
						>
							{w.title}
						</button>
					))}
				</div>
			)}
		</Taskbar>
	);
}

const Template: StoryFn = () => {
	const containerRef = useRef<HTMLDivElement>(null);
	const [snapZone, setSnapZone] = useState<SnapZone | null>(null);

	return (
		<WindowManagerProvider boundsRef={containerRef}>
			<div
				ref={containerRef}
				style={{
					position: "relative",
					width: "100%",
					height: "500px",
					background: "#f0f0f0",
					overflow: "hidden",
				}}
			>
				<LaunchButtons />
				<WindowList
					onSnapZoneEnter={setSnapZone}
					onSnapZoneLeave={() => setSnapZone(null)}
				/>
				<SnapPreviewOverlay zone={snapZone} />
				<SimpleTaskbar />
			</div>
		</WindowManagerProvider>
	);
};

export const Default = Template.bind({});

const WithDefaultWindowsTemplate: StoryFn = () => {
	const containerRef = useRef<HTMLDivElement>(null);
	const [snapZone, setSnapZone] = useState<SnapZone | null>(null);

	return (
		<WindowManagerProvider
			boundsRef={containerRef}
			defaultWindows={[
				{
					id: "window-1",
					title: "First Window",
					position: { x: 50, y: 80 },
					size: { width: 300, height: 200 },
					zIndex: 1,
					displayState: "normal",
				},
				{
					id: "window-2",
					title: "Second Window",
					position: { x: 200, y: 150 },
					size: { width: 300, height: 200 },
					zIndex: 2,
					displayState: "normal",
				},
			]}
		>
			<div
				ref={containerRef}
				style={{
					position: "relative",
					width: "100%",
					height: "500px",
					background: "#f0f0f0",
					overflow: "hidden",
				}}
			>
				<LaunchButtons />
				<WindowList
					onSnapZoneEnter={setSnapZone}
					onSnapZoneLeave={() => setSnapZone(null)}
				/>
				<SnapPreviewOverlay zone={snapZone} />
				<SimpleTaskbar />
			</div>
		</WindowManagerProvider>
	);
};

export const WithDefaultWindows = WithDefaultWindowsTemplate.bind({});

// ============================================
// Component Registry Pattern Story
// ============================================

// Example app components that will be registered
function SettingsPanel({ windowId }: { windowId: string }) {
	return (
		<div style={{ padding: "16px" }}>
			<h3 style={{ margin: "0 0 16px 0" }}>Settings</h3>
			<div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
				<label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
					<input type="checkbox" defaultChecked={true} />
					Enable notifications
				</label>
				<label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
					<input type="checkbox" />
					Dark mode
				</label>
				<label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
					<input type="checkbox" defaultChecked={true} />
					Auto-save
				</label>
			</div>
			<small style={{ color: "#666", display: "block", marginTop: "16px" }}>
				Window ID: {windowId}
			</small>
		</div>
	);
}

function TerminalApp({
	windowId,
	initialPath,
}: {
	windowId: string;
	initialPath?: string;
}) {
	const [history, setHistory] = useState<string[]>([
		`$ cd ${initialPath ?? "/home/user"}`,
		`user@desktop:${initialPath ?? "/home/user"}$`,
	]);
	const [input, setInput] = useState("");

	const handleCommand = () => {
		if (!input.trim()) {
			return;
		}
		setHistory((prev) => [
			...prev,
			`$ ${input}`,
			input === "ls"
				? "Documents  Downloads  Pictures  Videos"
				: input === "pwd"
					? (initialPath ?? "/home/user")
					: `command not found: ${input}`,
			`user@desktop:${initialPath ?? "/home/user"}$`,
		]);
		setInput("");
	};

	return (
		<div
			style={{
				background: "#1e1e1e",
				color: "#00ff00",
				fontFamily: "monospace",
				fontSize: "12px",
				padding: "8px",
				height: "100%",
				display: "flex",
				flexDirection: "column",
			}}
		>
			<div style={{ flex: 1, overflow: "auto" }}>
				{history.map((line, i) => (
					<div key={`${windowId}-line-${i}-${line.slice(0, 20)}`}>{line}</div>
				))}
			</div>
			<div style={{ display: "flex", gap: "4px" }}>
				<span>$</span>
				<input
					type="text"
					value={input}
					onChange={(e) => setInput(e.target.value)}
					onKeyDown={(e) => e.key === "Enter" && handleCommand()}
					style={{
						flex: 1,
						background: "transparent",
						border: "none",
						color: "#00ff00",
						fontFamily: "monospace",
						fontSize: "12px",
						outline: "none",
					}}
					placeholder="Type 'ls' or 'pwd'..."
				/>
			</div>
		</div>
	);
}

function NotesApp({ windowId }: { windowId: string }) {
	const [text, setText] = useState("Start typing your notes here...");

	return (
		<div
			style={{
				padding: "16px",
				height: "100%",
				display: "flex",
				flexDirection: "column",
			}}
		>
			<h3 style={{ margin: "0 0 12px 0" }}>Notes</h3>
			<textarea
				value={text}
				onChange={(e) => setText(e.target.value)}
				style={{
					flex: 1,
					padding: "8px",
					border: "1px solid #ddd",
					borderRadius: "4px",
					resize: "none",
					fontFamily: "inherit",
				}}
			/>
			<small style={{ color: "#666", marginTop: "8px" }}>
				{text.length} characters | Window: {windowId}
			</small>
		</div>
	);
}

// Define the registry
const appRegistry: WindowRegistry = {
	settings: SettingsPanel,
	terminal: TerminalApp,
	notes: NotesApp,
};

// Reusable window chrome component for registry-based windows
function RegistryWindowChrome({
	windowId,
	title,
	children,
	onSnapZoneEnter,
	onSnapZoneLeave,
}: {
	windowId: string;
	title: string;
	children: ReactNode;
	onSnapZoneEnter?: (zone: SnapZone) => void;
	onSnapZoneLeave?: () => void;
}) {
	const {
		state,
		updateWindow,
		closeWindow,
		minimizeWindow,
		maximizeWindow,
		restoreWindow,
	} = useWindowManager();
	const win = state.windows.find((w) => w.id === windowId);

	const titleBarRef = useRef<HTMLDivElement>(null);

	const { isDragging, dragHandleProps } = useWindowDrag({
		windowId,
		dragHandleRef: titleBarRef,
		enableDoubleClickMaximize: true,
		enableSnapToEdges: true,
		onSnapZoneEnter,
		onSnapZoneLeave,
	});

	const { resizeHandleProps } = useResize(
		win?.size ?? { width: 200, height: 100 },
		win?.position ?? { x: 0, y: 0 },
		{
			minWidth: 250,
			minHeight: 200,
			onResize: (size, position) => {
				updateWindow(windowId, { size, position });
			},
		},
	);

	if (!win) {
		return null;
	}

	const isMaximized = win.displayState === "maximized";

	return (
		<Window
			id={windowId}
			style={{
				background: "white",
				border: "1px solid #ccc",
				borderRadius: isMaximized ? 0 : "4px",
				boxShadow: isMaximized ? "none" : "0 4px 12px rgba(0,0,0,0.15)",
				overflow: "hidden",
				display: "flex",
				flexDirection: "column",
			}}
		>
			{/* Title Bar */}
			<div
				ref={titleBarRef}
				{...dragHandleProps}
				style={{
					padding: "8px 12px",
					background: isDragging ? "#444" : "#333",
					color: "white",
					cursor: isMaximized ? "default" : isDragging ? "grabbing" : "grab",
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					userSelect: "none",
				}}
			>
				<span>{title}</span>
				<div style={{ display: "flex", gap: "8px" }}>
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							minimizeWindow(windowId);
						}}
						style={{
							background: "transparent",
							border: "none",
							color: "white",
							cursor: "pointer",
							fontSize: "14px",
						}}
					>
						_
					</button>
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							isMaximized ? restoreWindow(windowId) : maximizeWindow(windowId);
						}}
						style={{
							background: "transparent",
							border: "none",
							color: "white",
							cursor: "pointer",
							fontSize: "14px",
						}}
					>
						□
					</button>
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							closeWindow(windowId);
						}}
						style={{
							background: "transparent",
							border: "none",
							color: "white",
							cursor: "pointer",
							fontSize: "16px",
						}}
					>
						×
					</button>
				</div>
			</div>
			{/* Content */}
			<div style={{ flex: 1, overflow: "auto" }}>{children}</div>
			{/* Resize Handles */}
			{!isMaximized && (
				<>
					<div
						{...resizeHandleProps("e")}
						style={{
							...resizeHandleProps("e").style,
							position: "absolute",
							right: 0,
							top: 0,
							bottom: 0,
							width: "4px",
						}}
					/>
					<div
						{...resizeHandleProps("s")}
						style={{
							...resizeHandleProps("s").style,
							position: "absolute",
							bottom: 0,
							left: 0,
							right: 0,
							height: "4px",
						}}
					/>
					<div
						{...resizeHandleProps("se")}
						style={{
							...resizeHandleProps("se").style,
							position: "absolute",
							bottom: 0,
							right: 0,
							width: "12px",
							height: "12px",
						}}
					/>
				</>
			)}
		</Window>
	);
}

function RegistryLaunchButtons() {
	const { openWindow } = useWindowManager();

	const launchApp = (
		componentId: string,
		title: string,
		props?: Record<string, unknown>,
	) => {
		openWindow({
			id: `${componentId}-${Date.now()}`,
			title,
			componentId,
			componentProps: props,
			position: {
				x: 50 + Math.random() * 150,
				y: 80 + Math.random() * 100,
			},
			size: { width: 350, height: 280 },
		});
	};

	return (
		<div
			style={{
				display: "flex",
				gap: "8px",
				marginBottom: "16px",
				flexWrap: "wrap",
			}}
		>
			<button type="button" onClick={() => launchApp("settings", "Settings")}>
				Open Settings
			</button>
			<button
				type="button"
				onClick={() =>
					launchApp("terminal", "Terminal", { initialPath: "/home/user" })
				}
			>
				Open Terminal
			</button>
			<button
				type="button"
				onClick={() =>
					launchApp("terminal", "Terminal (Downloads)", {
						initialPath: "/home/user/Downloads",
					})
				}
			>
				Open Terminal (Downloads)
			</button>
			<button type="button" onClick={() => launchApp("notes", "Notes")}>
				Open Notes
			</button>
		</div>
	);
}

const ComponentRegistryTemplate: StoryFn = () => {
	const containerRef = useRef<HTMLDivElement>(null);
	const [snapZone, setSnapZone] = useState<SnapZone | null>(null);

	const defaultWindows: WindowState[] = [
		{
			id: "settings-default",
			title: "Settings",
			componentId: "settings",
			position: { x: 50, y: 80 },
			size: { width: 300, height: 250 },
			zIndex: 1,
			displayState: "normal",
		},
		{
			id: "terminal-default",
			title: "Terminal",
			componentId: "terminal",
			componentProps: { initialPath: "/home/user/Projects" },
			position: { x: 200, y: 150 },
			size: { width: 400, height: 300 },
			zIndex: 2,
			displayState: "normal",
		},
	];

	return (
		<WindowManagerProvider
			boundsRef={containerRef}
			registry={appRegistry}
			defaultWindows={defaultWindows}
		>
			<div
				ref={containerRef}
				style={{
					position: "relative",
					width: "100%",
					height: "600px",
					background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
					overflow: "hidden",
				}}
			>
				<div style={{ padding: "16px" }}>
					<RegistryLaunchButtons />
					<p style={{ color: "white", fontSize: "12px", margin: 0 }}>
						This story demonstrates the Component Registry pattern. Windows are
						rendered from state using componentId, enabling serializable state
						for localStorage/URL persistence.
					</p>
				</div>

				{/* Desktop auto-renders windows based on registry */}
				<Desktop>
					{({
						component: Component,
						windowId,
						componentProps,
						windowState,
					}) => (
						<RegistryWindowChrome
							windowId={windowId}
							title={windowState.title}
							onSnapZoneEnter={setSnapZone}
							onSnapZoneLeave={() => setSnapZone(null)}
						>
							<Component windowId={windowId} {...componentProps} />
						</RegistryWindowChrome>
					)}
				</Desktop>

				<SnapPreviewOverlay zone={snapZone} />
				<SimpleTaskbar />
			</div>
		</WindowManagerProvider>
	);
};

export const ComponentRegistry = ComponentRegistryTemplate.bind({});
