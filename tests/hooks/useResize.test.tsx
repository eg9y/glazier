import { act, renderHook } from "@testing-library/react";
import type React from "react";
import { describe, expect, it, vi } from "vitest";
import { useResize } from "../../src";

describe("useResize", () => {
	const initialSize = { width: 200, height: 100 };
	const initialPosition = { x: 50, y: 50 };

	it("returns isResizing as false initially", () => {
		const { result } = renderHook(() =>
			useResize(initialSize, initialPosition),
		);

		expect(result.current.isResizing).toBe(false);
	});

	it("returns resizeHandleProps function", () => {
		const { result } = renderHook(() =>
			useResize(initialSize, initialPosition),
		);

		const props = result.current.resizeHandleProps("se");
		expect(props).toHaveProperty("onPointerDown");
		expect(props).toHaveProperty("onPointerMove");
		expect(props).toHaveProperty("onPointerUp");
		expect(props.style.touchAction).toBe("none");
		expect(props.style.cursor).toBe("nwse-resize");
	});

	it("returns correct cursor for each direction", () => {
		const { result } = renderHook(() =>
			useResize(initialSize, initialPosition),
		);

		expect(result.current.resizeHandleProps("n").style.cursor).toBe(
			"ns-resize",
		);
		expect(result.current.resizeHandleProps("s").style.cursor).toBe(
			"ns-resize",
		);
		expect(result.current.resizeHandleProps("e").style.cursor).toBe(
			"ew-resize",
		);
		expect(result.current.resizeHandleProps("w").style.cursor).toBe(
			"ew-resize",
		);
		expect(result.current.resizeHandleProps("ne").style.cursor).toBe(
			"nesw-resize",
		);
		expect(result.current.resizeHandleProps("sw").style.cursor).toBe(
			"nesw-resize",
		);
		expect(result.current.resizeHandleProps("nw").style.cursor).toBe(
			"nwse-resize",
		);
		expect(result.current.resizeHandleProps("se").style.cursor).toBe(
			"nwse-resize",
		);
	});

	it("sets isResizing to true on pointer down", () => {
		const { result } = renderHook(() =>
			useResize(initialSize, initialPosition),
		);

		const props = result.current.resizeHandleProps("se");
		const mockEvent = {
			clientX: 100,
			clientY: 100,
			pointerId: 1,
			stopPropagation: vi.fn(),
			currentTarget: {
				setPointerCapture: vi.fn(),
			},
		} as unknown as React.PointerEvent<Element>;

		act(() => {
			props.onPointerDown(mockEvent);
		});

		expect(result.current.isResizing).toBe(true);
		expect(mockEvent.stopPropagation).toHaveBeenCalled();
	});

	it("calls onResizeStart callback", () => {
		const onResizeStart = vi.fn();
		const { result } = renderHook(() =>
			useResize(initialSize, initialPosition, { onResizeStart }),
		);

		const props = result.current.resizeHandleProps("se");
		const mockEvent = {
			clientX: 100,
			clientY: 100,
			pointerId: 1,
			stopPropagation: vi.fn(),
			currentTarget: {
				setPointerCapture: vi.fn(),
			},
		} as unknown as React.PointerEvent<Element>;

		act(() => {
			props.onPointerDown(mockEvent);
		});

		expect(onResizeStart).toHaveBeenCalled();
	});

	it("calls onResize with new size when resizing from SE", () => {
		const onResize = vi.fn();
		const { result } = renderHook(() =>
			useResize(initialSize, initialPosition, { onResize }),
		);

		const props = result.current.resizeHandleProps("se");

		const mockDownEvent = {
			clientX: 100,
			clientY: 100,
			pointerId: 1,
			stopPropagation: vi.fn(),
			currentTarget: {
				setPointerCapture: vi.fn(),
			},
		} as unknown as React.PointerEvent<Element>;

		act(() => {
			props.onPointerDown(mockDownEvent);
		});

		const mockMoveEvent = {
			clientX: 150,
			clientY: 120,
			pointerId: 1,
		} as unknown as React.PointerEvent<Element>;

		act(() => {
			props.onPointerMove(mockMoveEvent);
		});

		expect(onResize).toHaveBeenCalledWith(
			{ width: 250, height: 120 },
			{ x: 50, y: 50 },
		);
	});

	it("respects minWidth and minHeight constraints", () => {
		const onResize = vi.fn();
		const { result } = renderHook(() =>
			useResize(initialSize, initialPosition, {
				onResize,
				minWidth: 100,
				minHeight: 50,
			}),
		);

		const props = result.current.resizeHandleProps("se");

		const mockDownEvent = {
			clientX: 100,
			clientY: 100,
			pointerId: 1,
			stopPropagation: vi.fn(),
			currentTarget: {
				setPointerCapture: vi.fn(),
			},
		} as unknown as React.PointerEvent<Element>;

		act(() => {
			props.onPointerDown(mockDownEvent);
		});

		// Try to resize smaller than min
		const mockMoveEvent = {
			clientX: 0,
			clientY: 0,
			pointerId: 1,
		} as unknown as React.PointerEvent<Element>;

		act(() => {
			props.onPointerMove(mockMoveEvent);
		});

		expect(onResize).toHaveBeenCalledWith(
			{ width: 100, height: 50 },
			{ x: 50, y: 50 },
		);
	});

	it("respects maxWidth and maxHeight constraints", () => {
		const onResize = vi.fn();
		const { result } = renderHook(() =>
			useResize(initialSize, initialPosition, {
				onResize,
				maxWidth: 300,
				maxHeight: 200,
			}),
		);

		const props = result.current.resizeHandleProps("se");

		const mockDownEvent = {
			clientX: 100,
			clientY: 100,
			pointerId: 1,
			stopPropagation: vi.fn(),
			currentTarget: {
				setPointerCapture: vi.fn(),
			},
		} as unknown as React.PointerEvent<Element>;

		act(() => {
			props.onPointerDown(mockDownEvent);
		});

		// Try to resize larger than max
		const mockMoveEvent = {
			clientX: 500,
			clientY: 500,
			pointerId: 1,
		} as unknown as React.PointerEvent<Element>;

		act(() => {
			props.onPointerMove(mockMoveEvent);
		});

		expect(onResize).toHaveBeenCalledWith(
			{ width: 300, height: 200 },
			{ x: 50, y: 50 },
		);
	});

	it("adjusts position when resizing from W", () => {
		const onResize = vi.fn();
		const { result } = renderHook(() =>
			useResize(initialSize, initialPosition, { onResize }),
		);

		const props = result.current.resizeHandleProps("w");

		const mockDownEvent = {
			clientX: 100,
			clientY: 100,
			pointerId: 1,
			stopPropagation: vi.fn(),
			currentTarget: {
				setPointerCapture: vi.fn(),
			},
		} as unknown as React.PointerEvent<Element>;

		act(() => {
			props.onPointerDown(mockDownEvent);
		});

		// Move left by 50px (drag handle to 50)
		const mockMoveEvent = {
			clientX: 50,
			clientY: 100,
			pointerId: 1,
		} as unknown as React.PointerEvent<Element>;

		act(() => {
			props.onPointerMove(mockMoveEvent);
		});

		// Width increases by 50, position.x decreases by 50
		expect(onResize).toHaveBeenCalledWith(
			{ width: 250, height: 100 },
			{ x: 0, y: 50 },
		);
	});

	it("calls onResizeEnd callback", () => {
		const onResizeEnd = vi.fn();
		const { result } = renderHook(() =>
			useResize(initialSize, initialPosition, { onResizeEnd }),
		);

		const props = result.current.resizeHandleProps("se");

		const mockDownEvent = {
			clientX: 100,
			clientY: 100,
			pointerId: 1,
			stopPropagation: vi.fn(),
			currentTarget: {
				setPointerCapture: vi.fn(),
			},
		} as unknown as React.PointerEvent<Element>;

		act(() => {
			props.onPointerDown(mockDownEvent);
		});

		const mockUpEvent = {
			clientX: 150,
			clientY: 120,
			pointerId: 1,
			currentTarget: {
				releasePointerCapture: vi.fn(),
			},
		} as unknown as React.PointerEvent<Element>;

		act(() => {
			props.onPointerUp(mockUpEvent);
		});

		expect(onResizeEnd).toHaveBeenCalledWith(
			{ width: 250, height: 120 },
			{ x: 50, y: 50 },
		);
		expect(result.current.isResizing).toBe(false);
	});
});
