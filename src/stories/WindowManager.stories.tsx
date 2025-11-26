import type { Meta, StoryFn } from "@storybook/react";
import { Window, WindowManagerProvider, useDrag, useWindowManager } from "..";

export default {
	title: "WindowManager",
} as Meta;

function TitleBar({
	windowId,
	title,
	onClose,
}: { windowId: string; title: string; onClose: () => void }) {
	const { state, updateWindow } = useWindowManager();
	const win = state.windows.find((w) => w.id === windowId);

	const { isDragging, dragHandleProps } = useDrag({
		onDrag: (_, delta) => {
			if (!win) {
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
				cursor: isDragging ? "grabbing" : "grab",
				display: "flex",
				justifyContent: "space-between",
				alignItems: "center",
				userSelect: "none",
			}}
		>
			<span>{title}</span>
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
				x
			</button>
		</div>
	);
}

function WindowList() {
	const { state, closeWindow } = useWindowManager();

	return (
		<>
			{state.windows.map((win) => (
				<Window
					key={win.id}
					id={win.id}
					style={{
						background: "white",
						border: "1px solid #ccc",
						borderRadius: "4px",
						boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
						overflow: "hidden",
					}}
				>
					<TitleBar
						windowId={win.id}
						title={win.title}
						onClose={() => closeWindow(win.id)}
					/>
					<div style={{ padding: "16px" }}>Window content for {win.title}</div>
				</Window>
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
				},
				{
					id: "window-2",
					title: "Second Window",
					position: { x: 200, y: 150 },
					size: { width: 300, height: 200 },
					zIndex: 2,
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
			</div>
		</WindowManagerProvider>
	);
};

export const WithDefaultWindows = WithDefaultWindowsTemplate.bind({});
