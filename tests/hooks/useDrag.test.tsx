import { act, renderHook } from "@testing-library/react";
import type React from "react";
import { describe, expect, it, vi } from "vitest";
import { useDrag } from "../../src";
import type { UseDragOptions } from "../../src";

describe("useDrag", () => {
	it("returns isDragging as false initially", () => {
		const { result } = renderHook(() => useDrag());

		expect(result.current.isDragging).toBe(false);
	});

	it("returns dragHandleProps with required handlers", () => {
		const { result } = renderHook(() => useDrag());

		expect(result.current.dragHandleProps).toHaveProperty("onPointerDown");
		expect(result.current.dragHandleProps).toHaveProperty("onPointerMove");
		expect(result.current.dragHandleProps).toHaveProperty("onPointerUp");
		expect(result.current.dragHandleProps.style).toEqual({
			touchAction: "none",
		});
	});

	it("sets isDragging to true on pointer down", () => {
		const { result } = renderHook(() => useDrag());

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
		expect(mockEvent.currentTarget.setPointerCapture).toHaveBeenCalledWith(1);
	});

	it("sets isDragging to false on pointer up", () => {
		const { result } = renderHook(() => useDrag());

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
		expect(
			mockUpEvent.currentTarget.releasePointerCapture,
		).toHaveBeenCalledWith(1);
	});

	it("calls onDragStart callback", () => {
		const onDragStart = vi.fn();
		const { result } = renderHook(() => useDrag({ onDragStart }));

		const mockEvent = {
			clientX: 100,
			clientY: 200,
			pointerId: 1,
			currentTarget: {
				setPointerCapture: vi.fn(),
			},
		} as unknown as React.PointerEvent<Element>;

		act(() => {
			result.current.dragHandleProps.onPointerDown(mockEvent);
		});

		expect(onDragStart).toHaveBeenCalledWith({ x: 100, y: 200 });
	});

	it("calls onDrag callback with position and delta", () => {
		const onDrag = vi.fn();
		const { result } = renderHook(() => useDrag({ onDrag }));

		const mockDownEvent = {
			clientX: 100,
			clientY: 100,
			pointerId: 1,
			currentTarget: {
				setPointerCapture: vi.fn(),
			},
		} as unknown as React.PointerEvent<Element>;

		const mockMoveEvent = {
			clientX: 150,
			clientY: 120,
			pointerId: 1,
		} as unknown as React.PointerEvent<Element>;

		act(() => {
			result.current.dragHandleProps.onPointerDown(mockDownEvent);
		});

		act(() => {
			result.current.dragHandleProps.onPointerMove(mockMoveEvent);
		});

		expect(onDrag).toHaveBeenCalledWith({ x: 150, y: 120 }, { x: 50, y: 20 });
	});

	it("does not call onDrag when not dragging", () => {
		const onDrag = vi.fn();
		const { result } = renderHook(() => useDrag({ onDrag }));

		const mockMoveEvent = {
			clientX: 150,
			clientY: 120,
			pointerId: 1,
		} as unknown as React.PointerEvent<Element>;

		act(() => {
			result.current.dragHandleProps.onPointerMove(mockMoveEvent);
		});

		expect(onDrag).not.toHaveBeenCalled();
	});

	it("calls onDragEnd callback", () => {
		const onDragEnd = vi.fn();
		const { result } = renderHook(() => useDrag({ onDragEnd }));

		const mockDownEvent = {
			clientX: 100,
			clientY: 100,
			pointerId: 1,
			currentTarget: {
				setPointerCapture: vi.fn(),
			},
		} as unknown as React.PointerEvent<Element>;

		const mockUpEvent = {
			clientX: 200,
			clientY: 250,
			pointerId: 1,
			currentTarget: {
				releasePointerCapture: vi.fn(),
			},
		} as unknown as React.PointerEvent<Element>;

		act(() => {
			result.current.dragHandleProps.onPointerDown(mockDownEvent);
		});

		act(() => {
			result.current.dragHandleProps.onPointerUp(mockUpEvent);
		});

		expect(onDragEnd).toHaveBeenCalledWith({ x: 200, y: 250 });
	});

	it("calculates delta correctly across multiple moves", () => {
		const onDrag = vi.fn();
		const { result } = renderHook(() => useDrag({ onDrag }));

		const mockDownEvent = {
			clientX: 100,
			clientY: 100,
			pointerId: 1,
			currentTarget: {
				setPointerCapture: vi.fn(),
			},
		} as unknown as React.PointerEvent<Element>;

		act(() => {
			result.current.dragHandleProps.onPointerDown(mockDownEvent);
		});

		// First move
		act(() => {
			result.current.dragHandleProps.onPointerMove({
				clientX: 110,
				clientY: 105,
				pointerId: 1,
			} as unknown as React.PointerEvent<Element>);
		});

		expect(onDrag).toHaveBeenLastCalledWith(
			{ x: 110, y: 105 },
			{ x: 10, y: 5 },
		);

		// Second move - delta should be from last position, not start
		act(() => {
			result.current.dragHandleProps.onPointerMove({
				clientX: 120,
				clientY: 115,
				pointerId: 1,
			} as unknown as React.PointerEvent<Element>);
		});

		expect(onDrag).toHaveBeenLastCalledWith(
			{ x: 120, y: 115 },
			{ x: 10, y: 10 },
		);
	});

	describe("bounds constraint", () => {
		const createDragSequence = (options: UseDragOptions) => {
			const { result } = renderHook(() => useDrag(options));

			const pointerDown = () => {
				act(() => {
					result.current.dragHandleProps.onPointerDown({
						clientX: 100,
						clientY: 100,
						pointerId: 1,
						currentTarget: { setPointerCapture: vi.fn() },
					} as unknown as React.PointerEvent<Element>);
				});
			};

			const pointerUp = () => {
				act(() => {
					result.current.dragHandleProps.onPointerUp({
						clientX: 150,
						clientY: 150,
						pointerId: 1,
						currentTarget: { releasePointerCapture: vi.fn() },
					} as unknown as React.PointerEvent<Element>);
				});
			};

			return { pointerDown, pointerUp };
		};

		it("calls onConstrainToBounds when window is outside container", () => {
			const onConstrainToBounds = vi.fn();
			const getBoundsConstraint = vi.fn().mockReturnValue({
				container: { width: 800, height: 600 },
				windowSize: { width: 200, height: 150 },
				windowPosition: { x: 700, y: 500 }, // Right and bottom edges overflow
			});

			const { pointerDown, pointerUp } = createDragSequence({
				getBoundsConstraint,
				onConstrainToBounds,
			});

			pointerDown();
			pointerUp();

			expect(onConstrainToBounds).toHaveBeenCalledWith({ x: 600, y: 450 });
		});

		it("does not call onConstrainToBounds when window is within bounds", () => {
			const onConstrainToBounds = vi.fn();
			const getBoundsConstraint = vi.fn().mockReturnValue({
				container: { width: 800, height: 600 },
				windowSize: { width: 200, height: 150 },
				windowPosition: { x: 100, y: 100 }, // Fully within bounds
			});

			const { pointerDown, pointerUp } = createDragSequence({
				getBoundsConstraint,
				onConstrainToBounds,
			});

			pointerDown();
			pointerUp();

			expect(onConstrainToBounds).not.toHaveBeenCalled();
		});

		it("constrains negative positions to zero", () => {
			const onConstrainToBounds = vi.fn();
			const getBoundsConstraint = vi.fn().mockReturnValue({
				container: { width: 800, height: 600 },
				windowSize: { width: 200, height: 150 },
				windowPosition: { x: -50, y: -30 },
			});

			const { pointerDown, pointerUp } = createDragSequence({
				getBoundsConstraint,
				onConstrainToBounds,
			});

			pointerDown();
			pointerUp();

			expect(onConstrainToBounds).toHaveBeenCalledWith({ x: 0, y: 0 });
		});

		it("does nothing when getBoundsConstraint returns null", () => {
			const onConstrainToBounds = vi.fn();
			const getBoundsConstraint = vi.fn().mockReturnValue(null);

			const { pointerDown, pointerUp } = createDragSequence({
				getBoundsConstraint,
				onConstrainToBounds,
			});

			pointerDown();
			pointerUp();

			expect(onConstrainToBounds).not.toHaveBeenCalled();
		});
	});
});
