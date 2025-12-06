import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { WindowManagerProvider, useWindow, useWindowManager } from "../../src";

function createWrapper() {
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

describe("useWindow", () => {
	it("throws when used outside provider", () => {
		expect(() => {
			renderHook(() => useWindow("win-1"));
		}).toThrow("useWindow must be used within a WindowManagerProvider");
	});

	it("throws when window not found", () => {
		expect(() => {
			renderHook(() => useWindow("non-existent"), {
				wrapper: createWrapper(),
			});
		}).toThrow('Window with id "non-existent" not found');
	});

	it("returns window state", () => {
		const { result } = renderHook(() => useWindow("win-1"), {
			wrapper: createWrapper(),
		});

		expect(result.current.id).toBe("win-1");
		expect(result.current.title).toBe("Window 1");
		expect(result.current.displayState).toBe("normal");
	});

	it("returns isFocused correctly", () => {
		const { result } = renderHook(
			() => ({
				win1: useWindow("win-1"),
				win2: useWindow("win-2"),
			}),
			{ wrapper: createWrapper() },
		);

		// win-1 is active by default (first window)
		expect(result.current.win1.isFocused).toBe(true);
		expect(result.current.win2.isFocused).toBe(false);
	});

	it("close method closes the window", () => {
		const { result } = renderHook(
			() => ({
				manager: useWindowManager(),
			}),
			{ wrapper: createWrapper() },
		);

		expect(result.current.manager.state.windows).toHaveLength(2);

		// Use closeWindow from manager directly since useWindow throws after close
		act(() => {
			result.current.manager.closeWindow("win-1");
		});

		// closeWindow marks window as closing (for animation)
		expect(result.current.manager.closingWindowIds.has("win-1")).toBe(true);

		// finalizeClose actually removes the window
		act(() => {
			result.current.manager.finalizeClose("win-1");
		});

		expect(result.current.manager.state.windows).toHaveLength(1);
		expect(
			result.current.manager.state.windows.find((w) => w.id === "win-1"),
		).toBeUndefined();
	});

	it("minimize method minimizes the window", () => {
		const { result } = renderHook(
			() => ({
				useWindow: useWindow("win-1"),
				useManager: useWindowManager(),
			}),
			{ wrapper: createWrapper() },
		);

		act(() => {
			result.current.useWindow.minimize();
		});

		const win1 = result.current.useManager.state.windows.find(
			(w) => w.id === "win-1",
		);
		expect(win1?.displayState).toBe("minimized");
	});

	it("maximize method maximizes the window", () => {
		const { result } = renderHook(
			() => ({
				useWindow: useWindow("win-1"),
				useManager: useWindowManager(),
			}),
			{ wrapper: createWrapper() },
		);

		act(() => {
			result.current.useWindow.maximize();
		});

		const win1 = result.current.useManager.state.windows.find(
			(w) => w.id === "win-1",
		);
		expect(win1?.displayState).toBe("maximized");
	});

	it("restore method restores the window", () => {
		const { result } = renderHook(
			() => ({
				useWindow: useWindow("win-1"),
				useManager: useWindowManager(),
			}),
			{ wrapper: createWrapper() },
		);

		act(() => {
			result.current.useWindow.minimize();
		});

		act(() => {
			result.current.useWindow.restore();
		});

		const win1 = result.current.useManager.state.windows.find(
			(w) => w.id === "win-1",
		);
		expect(win1?.displayState).toBe("normal");
	});
});
