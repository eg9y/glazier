import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { WindowManagerProvider, useWindowManager } from "../../src";

function createWrapper() {
	return function Wrapper({ children }: { children: ReactNode }) {
		return <WindowManagerProvider>{children}</WindowManagerProvider>;
	};
}

function createWrapperWithDefaults() {
	return function Wrapper({ children }: { children: ReactNode }) {
		return (
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
				{children}
			</WindowManagerProvider>
		);
	};
}

describe("useWindowManager", () => {
	it("throws when used outside provider", () => {
		expect(() => {
			renderHook(() => useWindowManager());
		}).toThrow("useWindowManager must be used within a WindowManagerProvider");
	});

	it("returns empty state initially", () => {
		const { result } = renderHook(() => useWindowManager(), {
			wrapper: createWrapper(),
		});

		expect(result.current.state.windows).toEqual([]);
		expect(result.current.state.activeWindowId).toBeNull();
	});

	it("returns default windows when provided", () => {
		const { result } = renderHook(() => useWindowManager(), {
			wrapper: createWrapperWithDefaults(),
		});

		expect(result.current.state.windows).toHaveLength(2);
		expect(result.current.state.activeWindowId).toBe("win-1");
	});

	describe("openWindow", () => {
		it("adds a new window", () => {
			const { result } = renderHook(() => useWindowManager(), {
				wrapper: createWrapper(),
			});

			act(() => {
				result.current.openWindow({
					id: "new-win",
					title: "New Window",
					position: { x: 50, y: 50 },
					size: { width: 300, height: 200 },
				});
			});

			expect(result.current.state.windows).toHaveLength(1);
			expect(result.current.state.windows[0].id).toBe("new-win");
			expect(result.current.state.windows[0].title).toBe("New Window");
			expect(result.current.state.activeWindowId).toBe("new-win");
		});

		it("assigns zIndex automatically", () => {
			const { result } = renderHook(() => useWindowManager(), {
				wrapper: createWrapperWithDefaults(),
			});

			act(() => {
				result.current.openWindow({
					id: "new-win",
					title: "New Window",
					position: { x: 50, y: 50 },
					size: { width: 300, height: 200 },
				});
			});

			const newWindow = result.current.state.windows.find(
				(w) => w.id === "new-win",
			);
			expect(newWindow?.zIndex).toBe(3);
		});

		it("does not add duplicate window ids", () => {
			const { result } = renderHook(() => useWindowManager(), {
				wrapper: createWrapperWithDefaults(),
			});

			act(() => {
				result.current.openWindow({
					id: "win-1",
					title: "Duplicate",
					position: { x: 50, y: 50 },
					size: { width: 300, height: 200 },
				});
			});

			expect(result.current.state.windows).toHaveLength(2);
		});
	});

	describe("closeWindow", () => {
		it("removes a window", () => {
			const { result } = renderHook(() => useWindowManager(), {
				wrapper: createWrapperWithDefaults(),
			});

			act(() => {
				result.current.closeWindow("win-1");
			});

			// closeWindow marks window as closing (for animation)
			expect(result.current.closingWindowIds.has("win-1")).toBe(true);

			// finalizeClose actually removes the window
			act(() => {
				result.current.finalizeClose("win-1");
			});

			expect(result.current.state.windows).toHaveLength(1);
			expect(result.current.state.windows[0].id).toBe("win-2");
		});

		it("updates activeWindowId when active window is closed", () => {
			const { result } = renderHook(() => useWindowManager(), {
				wrapper: createWrapperWithDefaults(),
			});

			act(() => {
				result.current.closeWindow("win-1");
			});

			expect(result.current.state.activeWindowId).toBe("win-2");
		});

		it("sets activeWindowId to null when last window is closed", () => {
			const { result } = renderHook(() => useWindowManager(), {
				wrapper: createWrapper(),
			});

			act(() => {
				result.current.openWindow({
					id: "only-win",
					title: "Only Window",
					position: { x: 0, y: 0 },
					size: { width: 200, height: 100 },
				});
			});

			act(() => {
				result.current.closeWindow("only-win");
			});

			// activeWindowId is updated immediately by closeWindow
			expect(result.current.state.activeWindowId).toBeNull();

			// finalizeClose removes the window from state
			act(() => {
				result.current.finalizeClose("only-win");
			});

			expect(result.current.state.windows).toHaveLength(0);
		});
	});

	describe("focusWindow", () => {
		it("sets activeWindowId and brings window to front", () => {
			const { result } = renderHook(() => useWindowManager(), {
				wrapper: createWrapperWithDefaults(),
			});

			act(() => {
				result.current.focusWindow("win-1");
			});

			expect(result.current.state.activeWindowId).toBe("win-1");
			const win1 = result.current.state.windows.find((w) => w.id === "win-1");
			const win2 = result.current.state.windows.find((w) => w.id === "win-2");
			expect(win1?.zIndex).toBeGreaterThan(win2?.zIndex ?? 0);
		});

		it("does nothing for non-existent window", () => {
			const { result } = renderHook(() => useWindowManager(), {
				wrapper: createWrapperWithDefaults(),
			});

			const initialState = result.current.state;

			act(() => {
				result.current.focusWindow("non-existent");
			});

			expect(result.current.state.activeWindowId).toBe(
				initialState.activeWindowId,
			);
		});
	});

	describe("updateWindow", () => {
		it("updates window position", () => {
			const { result } = renderHook(() => useWindowManager(), {
				wrapper: createWrapperWithDefaults(),
			});

			act(() => {
				result.current.updateWindow("win-1", {
					position: { x: 500, y: 500 },
				});
			});

			const win1 = result.current.state.windows.find((w) => w.id === "win-1");
			expect(win1?.position).toEqual({ x: 500, y: 500 });
		});

		it("updates window size", () => {
			const { result } = renderHook(() => useWindowManager(), {
				wrapper: createWrapperWithDefaults(),
			});

			act(() => {
				result.current.updateWindow("win-1", {
					size: { width: 800, height: 600 },
				});
			});

			const win1 = result.current.state.windows.find((w) => w.id === "win-1");
			expect(win1?.size).toEqual({ width: 800, height: 600 });
		});

		it("updates window title", () => {
			const { result } = renderHook(() => useWindowManager(), {
				wrapper: createWrapperWithDefaults(),
			});

			act(() => {
				result.current.updateWindow("win-1", {
					title: "Updated Title",
				});
			});

			const win1 = result.current.state.windows.find((w) => w.id === "win-1");
			expect(win1?.title).toBe("Updated Title");
		});
	});

	describe("bringToFront", () => {
		it("increases window zIndex to highest", () => {
			const { result } = renderHook(() => useWindowManager(), {
				wrapper: createWrapperWithDefaults(),
			});

			act(() => {
				result.current.bringToFront("win-1");
			});

			const win1 = result.current.state.windows.find((w) => w.id === "win-1");
			const win2 = result.current.state.windows.find((w) => w.id === "win-2");
			expect(win1?.zIndex).toBeGreaterThan(win2?.zIndex ?? 0);
		});
	});

	describe("sendToBack", () => {
		it("decreases window zIndex to lowest", () => {
			const { result } = renderHook(() => useWindowManager(), {
				wrapper: createWrapperWithDefaults(),
			});

			act(() => {
				result.current.sendToBack("win-2");
			});

			const win1 = result.current.state.windows.find((w) => w.id === "win-1");
			const win2 = result.current.state.windows.find((w) => w.id === "win-2");
			expect(win2?.zIndex).toBeLessThan(win1?.zIndex ?? 0);
		});
	});

	describe("minimizeWindow", () => {
		it("sets displayState to minimized", () => {
			const { result } = renderHook(() => useWindowManager(), {
				wrapper: createWrapperWithDefaults(),
			});

			act(() => {
				result.current.minimizeWindow("win-1");
			});

			const win1 = result.current.state.windows.find((w) => w.id === "win-1");
			expect(win1?.displayState).toBe("minimized");
		});

		it("updates activeWindowId when minimizing active window", () => {
			const { result } = renderHook(() => useWindowManager(), {
				wrapper: createWrapperWithDefaults(),
			});

			expect(result.current.state.activeWindowId).toBe("win-1");

			act(() => {
				result.current.minimizeWindow("win-1");
			});

			expect(result.current.state.activeWindowId).toBe("win-2");
		});

		it("does nothing if already minimized", () => {
			const { result } = renderHook(() => useWindowManager(), {
				wrapper: createWrapperWithDefaults(),
			});

			act(() => {
				result.current.minimizeWindow("win-1");
			});

			const stateAfterFirst = result.current.state;

			act(() => {
				result.current.minimizeWindow("win-1");
			});

			expect(result.current.state).toBe(stateAfterFirst);
		});
	});

	describe("maximizeWindow", () => {
		it("sets displayState to maximized", () => {
			const { result } = renderHook(() => useWindowManager(), {
				wrapper: createWrapperWithDefaults(),
			});

			act(() => {
				result.current.maximizeWindow("win-1");
			});

			const win1 = result.current.state.windows.find((w) => w.id === "win-1");
			expect(win1?.displayState).toBe("maximized");
		});

		it("stores previousBounds for restore", () => {
			const { result } = renderHook(() => useWindowManager(), {
				wrapper: createWrapperWithDefaults(),
			});

			act(() => {
				result.current.maximizeWindow("win-1");
			});

			const win1 = result.current.state.windows.find((w) => w.id === "win-1");
			expect(win1?.previousBounds).toEqual({
				position: { x: 0, y: 0 },
				size: { width: 200, height: 100 },
			});
		});

		it("brings window to front", () => {
			const { result } = renderHook(() => useWindowManager(), {
				wrapper: createWrapperWithDefaults(),
			});

			act(() => {
				result.current.maximizeWindow("win-1");
			});

			const win1 = result.current.state.windows.find((w) => w.id === "win-1");
			const win2 = result.current.state.windows.find((w) => w.id === "win-2");
			expect(win1?.zIndex).toBeGreaterThan(win2?.zIndex ?? 0);
		});
	});

	describe("restoreWindow", () => {
		it("restores from minimized to normal", () => {
			const { result } = renderHook(() => useWindowManager(), {
				wrapper: createWrapperWithDefaults(),
			});

			act(() => {
				result.current.minimizeWindow("win-1");
			});

			act(() => {
				result.current.restoreWindow("win-1");
			});

			const win1 = result.current.state.windows.find((w) => w.id === "win-1");
			expect(win1?.displayState).toBe("normal");
		});

		it("restores from maximized to normal with previousBounds", () => {
			const { result } = renderHook(() => useWindowManager(), {
				wrapper: createWrapperWithDefaults(),
			});

			act(() => {
				result.current.maximizeWindow("win-1");
			});

			act(() => {
				result.current.restoreWindow("win-1");
			});

			const win1 = result.current.state.windows.find((w) => w.id === "win-1");
			expect(win1?.displayState).toBe("normal");
			expect(win1?.position).toEqual({ x: 0, y: 0 });
			expect(win1?.size).toEqual({ width: 200, height: 100 });
			expect(win1?.previousBounds).toBeUndefined();
		});

		it("sets as active and brings to front", () => {
			const { result } = renderHook(() => useWindowManager(), {
				wrapper: createWrapperWithDefaults(),
			});

			act(() => {
				result.current.minimizeWindow("win-1");
			});

			act(() => {
				result.current.restoreWindow("win-1");
			});

			expect(result.current.state.activeWindowId).toBe("win-1");
			const win1 = result.current.state.windows.find((w) => w.id === "win-1");
			const win2 = result.current.state.windows.find((w) => w.id === "win-2");
			expect(win1?.zIndex).toBeGreaterThan(win2?.zIndex ?? 0);
		});
	});
});
