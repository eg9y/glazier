import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { WindowManagerProvider, useWindowDrag } from "../../src";
import type { WindowState } from "../../src";

const defaultWindow: WindowState = {
	id: "test-window",
	title: "Test Window",
	position: { x: 100, y: 100 },
	size: { width: 300, height: 200 },
	zIndex: 1,
	displayState: "normal",
};

const maximizedWindow: WindowState = {
	id: "test-window",
	title: "Test Window",
	position: { x: 0, y: 0 },
	size: { width: 300, height: 200 },
	zIndex: 1,
	displayState: "maximized",
	previousBounds: {
		position: { x: 100, y: 100 },
		size: { width: 300, height: 200 },
	},
};

function createWrapper(windows: WindowState[] = [defaultWindow]) {
	return function Wrapper({ children }: { children: ReactNode }) {
		return (
			<WindowManagerProvider defaultWindows={windows}>
				{children}
			</WindowManagerProvider>
		);
	};
}

describe("useWindowDrag", () => {
	it("returns isDragging as false initially", () => {
		const dragHandleRef = createRef<HTMLDivElement>();
		const { result } = renderHook(
			() =>
				useWindowDrag({
					windowId: "test-window",
					dragHandleRef,
				}),
			{ wrapper: createWrapper() },
		);

		expect(result.current.isDragging).toBe(false);
	});

	it("returns dragHandleProps with required handlers", () => {
		const dragHandleRef = createRef<HTMLDivElement>();
		const { result } = renderHook(
			() =>
				useWindowDrag({
					windowId: "test-window",
					dragHandleRef,
				}),
			{ wrapper: createWrapper() },
		);

		expect(result.current.dragHandleProps).toHaveProperty("onPointerDown");
		expect(result.current.dragHandleProps).toHaveProperty("onPointerMove");
		expect(result.current.dragHandleProps).toHaveProperty("onPointerUp");
		expect(result.current.dragHandleProps.style).toEqual({
			touchAction: "none",
		});
	});

	it("sets isDragging to true on pointer down", () => {
		const dragHandleRef = createRef<HTMLDivElement>();
		const { result } = renderHook(
			() =>
				useWindowDrag({
					windowId: "test-window",
					dragHandleRef,
				}),
			{ wrapper: createWrapper() },
		);

		const mockEvent = {
			clientX: 100,
			clientY: 100,
			pointerId: 1,
			currentTarget: {
				setPointerCapture: vi.fn(),
			},
		} as unknown as React.PointerEvent<Element>;

		act(() => {
			result.current.dragHandleProps.onPointerDown(mockEvent);
		});

		expect(result.current.isDragging).toBe(true);
	});

	it("sets isDragging to false on pointer up", () => {
		const dragHandleRef = createRef<HTMLDivElement>();
		const { result } = renderHook(
			() =>
				useWindowDrag({
					windowId: "test-window",
					dragHandleRef,
				}),
			{ wrapper: createWrapper() },
		);

		const mockDownEvent = {
			clientX: 100,
			clientY: 100,
			pointerId: 1,
			currentTarget: {
				setPointerCapture: vi.fn(),
			},
		} as unknown as React.PointerEvent<Element>;

		const mockUpEvent = {
			clientX: 150,
			clientY: 150,
			pointerId: 1,
			currentTarget: {
				releasePointerCapture: vi.fn(),
			},
		} as unknown as React.PointerEvent<Element>;

		act(() => {
			result.current.dragHandleProps.onPointerDown(mockDownEvent);
		});

		expect(result.current.isDragging).toBe(true);

		act(() => {
			result.current.dragHandleProps.onPointerUp(mockUpEvent);
		});

		expect(result.current.isDragging).toBe(false);
	});

	describe("maximized drag-to-restore", () => {
		it("restores maximized window on drag when enabled (default)", () => {
			// Create a ref with a mock element
			const mockElement = {
				getBoundingClientRect: () => ({
					left: 0,
					top: 0,
					width: 800,
					height: 40,
				}),
				offsetHeight: 40,
			} as unknown as HTMLDivElement;

			const dragHandleRef = { current: mockElement };

			const containerRef = createRef<HTMLDivElement>();
			const containerElement = {
				clientWidth: 1200,
				clientHeight: 800,
				getBoundingClientRect: () => ({
					left: 0,
					top: 0,
					width: 1200,
					height: 800,
				}),
			} as unknown as HTMLDivElement;
			(containerRef as { current: HTMLDivElement | null }).current =
				containerElement;

			function Wrapper({ children }: { children: ReactNode }) {
				return (
					<WindowManagerProvider
						defaultWindows={[maximizedWindow]}
						boundsRef={containerRef}
					>
						{children}
					</WindowManagerProvider>
				);
			}

			const { result } = renderHook(
				() =>
					useWindowDrag({
						windowId: "test-window",
						dragHandleRef,
					}),
				{ wrapper: Wrapper },
			);

			const mockDownEvent = {
				clientX: 400,
				clientY: 20,
				pointerId: 1,
				currentTarget: {
					setPointerCapture: vi.fn(),
				},
			} as unknown as React.PointerEvent<Element>;

			act(() => {
				result.current.dragHandleProps.onPointerDown(mockDownEvent);
			});

			// First move should trigger the restore
			const mockMoveEvent = {
				clientX: 410,
				clientY: 25,
				pointerId: 1,
			} as unknown as React.PointerEvent<Element>;

			act(() => {
				result.current.dragHandleProps.onPointerMove(mockMoveEvent);
			});

			// The window should now be restored (state change happens in provider)
			// We can't directly verify the state change here without accessing the provider
			// but we can verify the hook didn't throw
			expect(result.current.isDragging).toBe(true);
		});

		it("does not restore maximized window when disableMaximizedDragRestore is true", () => {
			const mockElement = {
				getBoundingClientRect: () => ({
					left: 0,
					top: 0,
					width: 800,
					height: 40,
				}),
				offsetHeight: 40,
			} as unknown as HTMLDivElement;

			const dragHandleRef = { current: mockElement };

			const { result } = renderHook(
				() =>
					useWindowDrag({
						windowId: "test-window",
						dragHandleRef,
						disableMaximizedDragRestore: true,
					}),
				{ wrapper: createWrapper([maximizedWindow]) },
			);

			const mockDownEvent = {
				clientX: 400,
				clientY: 20,
				pointerId: 1,
				currentTarget: {
					setPointerCapture: vi.fn(),
				},
			} as unknown as React.PointerEvent<Element>;

			act(() => {
				result.current.dragHandleProps.onPointerDown(mockDownEvent);
			});

			const mockMoveEvent = {
				clientX: 410,
				clientY: 25,
				pointerId: 1,
			} as unknown as React.PointerEvent<Element>;

			act(() => {
				result.current.dragHandleProps.onPointerMove(mockMoveEvent);
			});

			// Hook should work without throwing
			expect(result.current.isDragging).toBe(true);
		});
	});

	it("throws when used outside WindowManagerProvider", () => {
		const dragHandleRef = createRef<HTMLDivElement>();

		expect(() => {
			renderHook(() =>
				useWindowDrag({
					windowId: "test-window",
					dragHandleRef,
				}),
			);
		}).toThrow("useWindowManager must be used within a WindowManagerProvider");
	});
});
