import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { WindowManagerProvider, useWindowManager } from "../../src";

function StateDisplay() {
	const { state } = useWindowManager();
	return (
		<div>
			<span data-testid="window-count">{state.windows.length}</span>
			<span data-testid="active-id">{state.activeWindowId ?? "none"}</span>
		</div>
	);
}

function BoundsDisplay() {
	const { boundsRef, getContainerBounds } = useWindowManager();
	const bounds = getContainerBounds();
	return (
		<div>
			<span data-testid="has-bounds-ref">{boundsRef ? "yes" : "no"}</span>
			<span data-testid="container-bounds">
				{bounds ? `${bounds.width}x${bounds.height}` : "none"}
			</span>
		</div>
	);
}

describe("WindowManagerProvider", () => {
	it("renders children", () => {
		render(
			<WindowManagerProvider>
				<div data-testid="child">Hello</div>
			</WindowManagerProvider>,
		);

		expect(screen.getByTestId("child")).toBeInTheDocument();
	});

	it("provides empty state by default", () => {
		render(
			<WindowManagerProvider>
				<StateDisplay />
			</WindowManagerProvider>,
		);

		expect(screen.getByTestId("window-count")).toHaveTextContent("0");
		expect(screen.getByTestId("active-id")).toHaveTextContent("none");
	});

	it("accepts defaultWindows prop", () => {
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
				<StateDisplay />
			</WindowManagerProvider>,
		);

		expect(screen.getByTestId("window-count")).toHaveTextContent("2");
		expect(screen.getByTestId("active-id")).toHaveTextContent("win-1");
	});

	it("sets first window as active by default", () => {
		render(
			<WindowManagerProvider
				defaultWindows={[
					{
						id: "first",
						title: "First",
						position: { x: 0, y: 0 },
						size: { width: 200, height: 100 },
						zIndex: 1,
						displayState: "normal",
					},
					{
						id: "second",
						title: "Second",
						position: { x: 100, y: 100 },
						size: { width: 200, height: 100 },
						zIndex: 2,
						displayState: "normal",
					},
				]}
			>
				<StateDisplay />
			</WindowManagerProvider>,
		);

		expect(screen.getByTestId("active-id")).toHaveTextContent("first");
	});

	describe("boundsRef", () => {
		it("provides null boundsRef by default", () => {
			render(
				<WindowManagerProvider>
					<BoundsDisplay />
				</WindowManagerProvider>,
			);

			expect(screen.getByTestId("has-bounds-ref")).toHaveTextContent("no");
		});

		it("provides boundsRef when passed", () => {
			const containerRef = createRef<HTMLDivElement>();

			render(
				<WindowManagerProvider boundsRef={containerRef}>
					<BoundsDisplay />
				</WindowManagerProvider>,
			);

			expect(screen.getByTestId("has-bounds-ref")).toHaveTextContent("yes");
		});

		it("getContainerBounds returns null when boundsRef is not set", () => {
			render(
				<WindowManagerProvider>
					<BoundsDisplay />
				</WindowManagerProvider>,
			);

			expect(screen.getByTestId("container-bounds")).toHaveTextContent("none");
		});

		it("getContainerBounds returns null when boundsRef.current is null", () => {
			const containerRef = createRef<HTMLDivElement>();
			// ref.current is null by default

			render(
				<WindowManagerProvider boundsRef={containerRef}>
					<BoundsDisplay />
				</WindowManagerProvider>,
			);

			expect(screen.getByTestId("container-bounds")).toHaveTextContent("none");
		});

		it("getContainerBounds returns dimensions when boundsRef has element", () => {
			const containerRef = createRef<HTMLDivElement>();

			// Create a mock element with clientWidth/clientHeight
			const mockElement = document.createElement("div");
			Object.defineProperty(mockElement, "clientWidth", { value: 800 });
			Object.defineProperty(mockElement, "clientHeight", { value: 600 });
			(containerRef as { current: HTMLDivElement | null }).current =
				mockElement;

			render(
				<WindowManagerProvider boundsRef={containerRef}>
					<BoundsDisplay />
				</WindowManagerProvider>,
			);

			expect(screen.getByTestId("container-bounds")).toHaveTextContent(
				"800x600",
			);
		});
	});
});
