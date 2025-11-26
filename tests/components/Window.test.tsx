import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Window, WindowManagerProvider } from "../../src";

describe("Window", () => {
	it("renders nothing when window id not found", () => {
		const { container } = render(
			<WindowManagerProvider>
				<Window id="non-existent">
					<div>Content</div>
				</Window>
			</WindowManagerProvider>,
		);

		expect(container.querySelector("div")).toBeNull();
	});

	it("renders children when window exists", () => {
		render(
			<WindowManagerProvider
				defaultWindows={[
					{
						id: "win-1",
						title: "Test Window",
						position: { x: 100, y: 100 },
						size: { width: 300, height: 200 },
						zIndex: 1,
					},
				]}
			>
				<Window id="win-1">
					<div data-testid="content">Window Content</div>
				</Window>
			</WindowManagerProvider>,
		);

		expect(screen.getByTestId("content")).toBeInTheDocument();
		expect(screen.getByText("Window Content")).toBeInTheDocument();
	});

	it("applies correct positioning styles", () => {
		render(
			<WindowManagerProvider
				defaultWindows={[
					{
						id: "win-1",
						title: "Test Window",
						position: { x: 150, y: 200 },
						size: { width: 400, height: 300 },
						zIndex: 5,
					},
				]}
			>
				<Window id="win-1" data-testid="window">
					<div>Content</div>
				</Window>
			</WindowManagerProvider>,
		);

		const windowEl = screen.getByText("Content").parentElement;
		expect(windowEl).toHaveStyle({
			position: "absolute",
			transform: "translate3d(150px, 200px, 0)",
			width: "400px",
			height: "300px",
			zIndex: "5",
		});
	});

	it("applies custom className", () => {
		render(
			<WindowManagerProvider
				defaultWindows={[
					{
						id: "win-1",
						title: "Test Window",
						position: { x: 0, y: 0 },
						size: { width: 200, height: 100 },
						zIndex: 1,
					},
				]}
			>
				<Window id="win-1" className="custom-class">
					<div>Content</div>
				</Window>
			</WindowManagerProvider>,
		);

		const windowEl = screen.getByText("Content").parentElement;
		expect(windowEl).toHaveClass("custom-class");
	});

	it("applies custom styles", () => {
		render(
			<WindowManagerProvider
				defaultWindows={[
					{
						id: "win-1",
						title: "Test Window",
						position: { x: 0, y: 0 },
						size: { width: 200, height: 100 },
						zIndex: 1,
					},
				]}
			>
				<Window id="win-1" style={{ border: "2px solid blue" }}>
					<div>Content</div>
				</Window>
			</WindowManagerProvider>,
		);

		const windowEl = screen.getByText("Content").parentElement;
		expect(windowEl?.style.border).toBe("2px solid blue");
	});

	it("calls bringToFront on pointer down", () => {
		render(
			<WindowManagerProvider
				defaultWindows={[
					{
						id: "win-1",
						title: "Window 1",
						position: { x: 0, y: 0 },
						size: { width: 200, height: 100 },
						zIndex: 1,
					},
					{
						id: "win-2",
						title: "Window 2",
						position: { x: 50, y: 50 },
						size: { width: 200, height: 100 },
						zIndex: 2,
					},
				]}
			>
				<Window id="win-1">
					<div data-testid="win1-content">Content 1</div>
				</Window>
				<Window id="win-2">
					<div data-testid="win2-content">Content 2</div>
				</Window>
			</WindowManagerProvider>,
		);

		const win1 = screen.getByTestId("win1-content").parentElement;
		const win2 = screen.getByTestId("win2-content").parentElement;

		// Initially win-2 has higher zIndex
		expect(Number(win1?.style.zIndex)).toBeLessThan(Number(win2?.style.zIndex));

		// Click on win-1
		if (win1) {
			fireEvent.pointerDown(win1);
		}

		// Now win-1 should have higher zIndex
		expect(Number(win1?.style.zIndex)).toBeGreaterThan(
			Number(win2?.style.zIndex),
		);
	});
});
