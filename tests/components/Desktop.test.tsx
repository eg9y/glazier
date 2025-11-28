import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Desktop, WindowManagerProvider } from "../../src";

// Mock components
function SettingsPanel({ windowId }: { windowId: string }) {
	return <div data-testid="settings">Settings for {windowId}</div>;
}

function TerminalApp({
	windowId,
	cwd = "/",
}: {
	windowId: string;
	cwd?: string;
}) {
	return (
		<div data-testid="terminal">
			Terminal {windowId} at {cwd}
		</div>
	);
}

const registry = {
	settings: SettingsPanel,
	terminal: TerminalApp,
};

describe("Desktop", () => {
	let consoleSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		// biome-ignore lint/suspicious/noEmptyBlockStatements: Mock implementation intentionally empty
		consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
	});

	afterEach(() => {
		consoleSpy.mockRestore();
	});

	it("renders nothing when no registry is provided", () => {
		const { container } = render(
			<WindowManagerProvider>
				<Desktop>
					{({ component: Component, windowId }) => (
						<div>
							<Component windowId={windowId} />
						</div>
					)}
				</Desktop>
			</WindowManagerProvider>,
		);

		// Desktop should return null, so its wrapper div shouldn't exist
		expect(container.querySelector("div > div")).toBeNull();
		expect(consoleSpy).toHaveBeenCalledWith(
			expect.stringContaining("No registry provided"),
		);
	});

	it("renders windows from registry", () => {
		render(
			<WindowManagerProvider
				registry={registry}
				defaultWindows={[
					{
						id: "win-1",
						title: "Settings",
						componentId: "settings",
						position: { x: 0, y: 0 },
						size: { width: 300, height: 200 },
						zIndex: 1,
						displayState: "normal",
					},
				]}
			>
				<Desktop>
					{({ component: Component, windowId, componentProps }) => (
						<div data-testid={`window-${windowId}`}>
							<Component windowId={windowId} {...componentProps} />
						</div>
					)}
				</Desktop>
			</WindowManagerProvider>,
		);

		expect(screen.getByTestId("window-win-1")).toBeInTheDocument();
		expect(screen.getByTestId("settings")).toBeInTheDocument();
		expect(screen.getByTestId("settings")).toHaveTextContent(
			"Settings for win-1",
		);
	});

	it("renders multiple windows", () => {
		render(
			<WindowManagerProvider
				registry={registry}
				defaultWindows={[
					{
						id: "win-1",
						title: "Settings",
						componentId: "settings",
						position: { x: 0, y: 0 },
						size: { width: 300, height: 200 },
						zIndex: 1,
						displayState: "normal",
					},
					{
						id: "win-2",
						title: "Terminal",
						componentId: "terminal",
						componentProps: { cwd: "/home" },
						position: { x: 100, y: 100 },
						size: { width: 400, height: 300 },
						zIndex: 2,
						displayState: "normal",
					},
				]}
			>
				<Desktop>
					{({ component: Component, windowId, componentProps }) => (
						<div data-testid={`window-${windowId}`}>
							<Component windowId={windowId} {...componentProps} />
						</div>
					)}
				</Desktop>
			</WindowManagerProvider>,
		);

		expect(screen.getByTestId("window-win-1")).toBeInTheDocument();
		expect(screen.getByTestId("window-win-2")).toBeInTheDocument();
		expect(screen.getByTestId("settings")).toBeInTheDocument();
		expect(screen.getByTestId("terminal")).toBeInTheDocument();
	});

	it("passes componentProps to resolved component", () => {
		render(
			<WindowManagerProvider
				registry={registry}
				defaultWindows={[
					{
						id: "term-1",
						title: "Terminal",
						componentId: "terminal",
						componentProps: { cwd: "/home/user" },
						position: { x: 0, y: 0 },
						size: { width: 400, height: 300 },
						zIndex: 1,
						displayState: "normal",
					},
				]}
			>
				<Desktop>
					{({ component: Component, windowId, componentProps }) => (
						<Component windowId={windowId} {...componentProps} />
					)}
				</Desktop>
			</WindowManagerProvider>,
		);

		expect(screen.getByTestId("terminal")).toHaveTextContent("/home/user");
	});

	it("warns and skips windows with invalid componentId", () => {
		render(
			<WindowManagerProvider
				registry={registry}
				defaultWindows={[
					{
						id: "win-1",
						title: "Valid",
						componentId: "settings",
						position: { x: 0, y: 0 },
						size: { width: 300, height: 200 },
						zIndex: 1,
						displayState: "normal",
					},
					{
						id: "win-2",
						title: "Invalid",
						componentId: "nonexistent",
						position: { x: 100, y: 100 },
						size: { width: 300, height: 200 },
						zIndex: 2,
						displayState: "normal",
					},
				]}
			>
				<Desktop>
					{({ component: Component, windowId, componentProps }) => (
						<div data-testid={`window-${windowId}`}>
							<Component windowId={windowId} {...componentProps} />
						</div>
					)}
				</Desktop>
			</WindowManagerProvider>,
		);

		// Valid window should render
		expect(screen.getByTestId("window-win-1")).toBeInTheDocument();
		// Invalid window should not render
		expect(screen.queryByTestId("window-win-2")).not.toBeInTheDocument();
		// Should warn about invalid componentId
		expect(consoleSpy).toHaveBeenCalledWith(
			expect.stringContaining("nonexistent"),
		);
	});

	it("ignores non-registry windows (those without componentId)", () => {
		render(
			<WindowManagerProvider
				registry={registry}
				defaultWindows={[
					{
						id: "registry-win",
						title: "Registry Window",
						componentId: "settings",
						position: { x: 0, y: 0 },
						size: { width: 300, height: 200 },
						zIndex: 1,
						displayState: "normal",
					},
					{
						id: "legacy-win",
						title: "Legacy Window",
						position: { x: 100, y: 100 },
						size: { width: 300, height: 200 },
						zIndex: 2,
						displayState: "normal",
					},
				]}
			>
				<Desktop>
					{({ component: Component, windowId, componentProps }) => (
						<div data-testid={`window-${windowId}`}>
							<Component windowId={windowId} {...componentProps} />
						</div>
					)}
				</Desktop>
			</WindowManagerProvider>,
		);

		// Registry window should render
		expect(screen.getByTestId("window-registry-win")).toBeInTheDocument();
		// Non-registry window should NOT be rendered by Desktop
		expect(screen.queryByTestId("window-legacy-win")).not.toBeInTheDocument();
		// No warning should be logged for legacy windows
		expect(consoleSpy).not.toHaveBeenCalled();
	});

	it("provides windowState in render props", () => {
		render(
			<WindowManagerProvider
				registry={registry}
				defaultWindows={[
					{
						id: "win-1",
						title: "My Window Title",
						componentId: "settings",
						position: { x: 50, y: 100 },
						size: { width: 300, height: 200 },
						zIndex: 5,
						displayState: "normal",
					},
				]}
			>
				<Desktop>
					{({ windowState }) => (
						<div data-testid="window-info">
							<span data-testid="title">{windowState.title}</span>
							<span data-testid="x">{windowState.position.x}</span>
							<span data-testid="y">{windowState.position.y}</span>
							<span data-testid="zIndex">{windowState.zIndex}</span>
						</div>
					)}
				</Desktop>
			</WindowManagerProvider>,
		);

		expect(screen.getByTestId("title")).toHaveTextContent("My Window Title");
		expect(screen.getByTestId("x")).toHaveTextContent("50");
		expect(screen.getByTestId("y")).toHaveTextContent("100");
		expect(screen.getByTestId("zIndex")).toHaveTextContent("5");
	});

	it("applies className and style to container", () => {
		render(
			<WindowManagerProvider
				registry={registry}
				defaultWindows={[
					{
						id: "win-1",
						title: "Settings",
						componentId: "settings",
						position: { x: 0, y: 0 },
						size: { width: 300, height: 200 },
						zIndex: 1,
						displayState: "normal",
					},
				]}
			>
				<Desktop className="my-desktop" style={{ backgroundColor: "red" }}>
					{({ component: Component, windowId }) => (
						<Component windowId={windowId} />
					)}
				</Desktop>
			</WindowManagerProvider>,
		);

		const desktop = document.querySelector(".my-desktop");
		expect(desktop).toBeInTheDocument();
		expect(desktop).toHaveAttribute("style", "background-color: red;");
	});

	it("renders empty container when no registry windows exist", () => {
		render(
			<WindowManagerProvider registry={registry} defaultWindows={[]}>
				<Desktop className="empty-desktop">
					{({ component: Component, windowId }) => (
						<Component windowId={windowId} />
					)}
				</Desktop>
			</WindowManagerProvider>,
		);

		const desktop = document.querySelector(".empty-desktop");
		expect(desktop).toBeInTheDocument();
		expect(desktop?.children.length).toBe(0);
	});
});
