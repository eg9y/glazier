import type { Meta, StoryFn } from "@storybook/react";
import {
	Taskbar,
	Window,
	WindowManagerProvider,
	useDrag,
	useResize,
	useWindowManager,
} from "..";

export default {
	title: "WindowManager",
} as Meta;

function TitleBar({
	windowId,
	title,
	onClose,
	onMinimize,
	onMaximize,
}: {
	windowId: string;
	title: string;
	onClose: () => void;
	onMinimize?: () => void;
	onMaximize?: () => void;
}) {
	const { state, updateWindow } = useWindowManager();
	const win = state.windows.find((w) => w.id === windowId);

	const { isDragging, dragHandleProps } = useDrag({
		onDrag: (_, delta) => {
			if (!win || win.displayState === "maximized") {
				return;
			}
			updateWindow(windowId, {
				position: {
					x: win.position.x + delta.x,
					y: win.position.y + delta.y,
				},
			});
		},
	});

	return (
		<div
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

function ResizableWindow({ windowId }: { windowId: string }) {
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

function WindowList() {
	const { state } = useWindowManager();

	return (
		<>
			{state.windows.map((win) => (
				<ResizableWindow key={win.id} windowId={win.id} />
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
	return (
		<WindowManagerProvider>
			<div
				style={{
					position: "relative",
					width: "100%",
					height: "500px",
					background: "#f0f0f0",
					overflow: "hidden",
				}}
			>
				<LaunchButtons />
				<WindowList />
				<SimpleTaskbar />
			</div>
		</WindowManagerProvider>
	);
};

export const Default = Template.bind({});

const WithDefaultWindowsTemplate: StoryFn = () => {
	return (
		<WindowManagerProvider
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
				style={{
					position: "relative",
					width: "100%",
					height: "500px",
					background: "#f0f0f0",
					overflow: "hidden",
				}}
			>
				<LaunchButtons />
				<WindowList />
				<SimpleTaskbar />
			</div>
		</WindowManagerProvider>
	);
};

export const WithDefaultWindows = WithDefaultWindowsTemplate.bind({});
