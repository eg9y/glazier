import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Taskbar, WindowManagerProvider, useWindowManager } from "../../src";

describe("Taskbar", () => {
	it("renders with render prop pattern", () => {
		render(
			<WindowManagerProvider>
				<Taskbar>
					{() => <div data-testid="taskbar">Taskbar Content</div>}
				</Taskbar>
			</WindowManagerProvider>,
		);

		expect(screen.getByTestId("taskbar")).toBeInTheDocument();
	});

	it("provides windows array to render prop", () => {
		render(
			<WindowManagerProvider
				defaultWindows={[
					{
						id: "win-1",
						title: "Window 1",
						position: { x: 0, y: 0 },
						size: { width: 200, height: 100 },
						zIndex: 1,
						displayState: "normal",
					},
					{
						id: "win-2",
						title: "Window 2",
						position: { x: 100, y: 100 },
						size: { width: 200, height: 100 },
						zIndex: 2,
						displayState: "normal",
					},
				]}
			>
				<Taskbar>
					{({ windows }) => (
						<div>
							{windows.map((w) => (
								<span key={w.id} data-testid={`window-${w.id}`}>
									{w.title}
								</span>
							))}
						</div>
					)}
				</Taskbar>
			</WindowManagerProvider>,
		);

		expect(screen.getByTestId("window-win-1")).toHaveTextContent("Window 1");
		expect(screen.getByTestId("window-win-2")).toHaveTextContent("Window 2");
	});

	it("provides activeWindowId to render prop", () => {
		render(
			<WindowManagerProvider
				defaultWindows={[
					{
						id: "win-1",
						title: "Window 1",
						position: { x: 0, y: 0 },
						size: { width: 200, height: 100 },
						zIndex: 1,
						displayState: "normal",
					},
				]}
			>
				<Taskbar>
					{({ activeWindowId }) => (
						<span data-testid="active">{activeWindowId}</span>
					)}
				</Taskbar>
			</WindowManagerProvider>,
		);

		expect(screen.getByTestId("active")).toHaveTextContent("win-1");
	});

	it("provides focusWindow function", () => {
		render(
			<WindowManagerProvider
				defaultWindows={[
					{
						id: "win-1",
						title: "Window 1",
						position: { x: 0, y: 0 },
						size: { width: 200, height: 100 },
						zIndex: 1,
						displayState: "normal",
					},
					{
						id: "win-2",
						title: "Window 2",
						position: { x: 100, y: 100 },
						size: { width: 200, height: 100 },
						zIndex: 2,
						displayState: "normal",
					},
				]}
			>
				<Taskbar>
					{({ activeWindowId, focusWindow }) => (
						<div>
							<span data-testid="active">{activeWindowId}</span>
							<button
								type="button"
								data-testid="focus-win2"
								onClick={() => focusWindow("win-2")}
							>
								Focus Win 2
							</button>
						</div>
					)}
				</Taskbar>
			</WindowManagerProvider>,
		);

		expect(screen.getByTestId("active")).toHaveTextContent("win-1");

		fireEvent.click(screen.getByTestId("focus-win2"));

		expect(screen.getByTestId("active")).toHaveTextContent("win-2");
	});

	it("provides minimizeWindow function", () => {
		render(
			<WindowManagerProvider
				defaultWindows={[
					{
						id: "win-1",
						title: "Window 1",
						position: { x: 0, y: 0 },
						size: { width: 200, height: 100 },
						zIndex: 1,
						displayState: "normal",
					},
				]}
			>
				<Taskbar>
					{({ windows, minimizeWindow }) => (
						<div>
							<span data-testid="state">{windows[0]?.displayState}</span>
							<button
								type="button"
								data-testid="minimize"
								onClick={() => minimizeWindow("win-1")}
							>
								Minimize
							</button>
						</div>
					)}
				</Taskbar>
			</WindowManagerProvider>,
		);

		expect(screen.getByTestId("state")).toHaveTextContent("normal");

		fireEvent.click(screen.getByTestId("minimize"));

		expect(screen.getByTestId("state")).toHaveTextContent("minimized");
	});

	it("provides restoreWindow function", () => {
		render(
			<WindowManagerProvider
				defaultWindows={[
					{
						id: "win-1",
						title: "Window 1",
						position: { x: 0, y: 0 },
						size: { width: 200, height: 100 },
						zIndex: 1,
						displayState: "minimized",
					},
				]}
			>
				<Taskbar>
					{({ windows, restoreWindow }) => (
						<div>
							<span data-testid="state">{windows[0]?.displayState}</span>
							<button
								type="button"
								data-testid="restore"
								onClick={() => restoreWindow("win-1")}
							>
								Restore
							</button>
						</div>
					)}
				</Taskbar>
			</WindowManagerProvider>,
		);

		expect(screen.getByTestId("state")).toHaveTextContent("minimized");

		fireEvent.click(screen.getByTestId("restore"));

		expect(screen.getByTestId("state")).toHaveTextContent("normal");
	});

	it("provides closeWindow function", () => {
		// Helper component to access finalizeClose
		function TestHelper() {
			const { closingWindowIds, finalizeClose } = useWindowManager();
			return (
				<>
					<span data-testid="closing">
						{closingWindowIds.has("win-1") ? "closing" : "not-closing"}
					</span>
					<button
						type="button"
						data-testid="finalize"
						onClick={() => finalizeClose("win-1")}
					>
						Finalize
					</button>
				</>
			);
		}

		render(
			<WindowManagerProvider
				defaultWindows={[
					{
						id: "win-1",
						title: "Window 1",
						position: { x: 0, y: 0 },
						size: { width: 200, height: 100 },
						zIndex: 1,
						displayState: "normal",
					},
				]}
			>
				<Taskbar>
					{({ windows, closeWindow }) => (
						<div>
							<span data-testid="count">{windows.length}</span>
							<button
								type="button"
								data-testid="close"
								onClick={() => closeWindow("win-1")}
							>
								Close
							</button>
						</div>
					)}
				</Taskbar>
				<TestHelper />
			</WindowManagerProvider>,
		);

		expect(screen.getByTestId("count")).toHaveTextContent("1");
		expect(screen.getByTestId("closing")).toHaveTextContent("not-closing");

		// closeWindow marks window as closing (for animation)
		fireEvent.click(screen.getByTestId("close"));

		expect(screen.getByTestId("closing")).toHaveTextContent("closing");
		expect(screen.getByTestId("count")).toHaveTextContent("1"); // Still in state

		// finalizeClose actually removes the window
		fireEvent.click(screen.getByTestId("finalize"));

		expect(screen.getByTestId("count")).toHaveTextContent("0");
	});
});
