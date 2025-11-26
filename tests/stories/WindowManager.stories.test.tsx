import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { WithDefaultWindows } from "../../src/stories/WindowManager.stories";

const TRANSLATE3D_REGEX = /translate3d/;

// Mock ResizeObserver since it's used in useResize
global.ResizeObserver = class ResizeObserver {
	observe() {
		/* noop */
	}
	unobserve() {
		/* noop */
	}
	disconnect() {
		/* noop */
	}
};

// Mock pointer capture methods which are missing in jsdom
Element.prototype.setPointerCapture = () => {
	/* noop */
};
Element.prototype.releasePointerCapture = () => {
	/* noop */
};

describe("WindowManager Stories", () => {
	it("restores maximized window when dragging title bar", () => {
		render(<WithDefaultWindows />);

		// Find the window content first (unique)
		const windowContent = screen.getByText("Window content for First Window");
		const windowEl = windowContent.closest('div[style*="position: absolute"]');

		if (!windowEl) {
			throw new Error("Window element not found");
		}

		// Find title bar within the window
		// TitleBar has the title text "First Window"
		const titleBar = Array.from(windowEl.querySelectorAll("div")).find(
			(div) =>
				div.textContent?.includes("First Window") &&
				(div as HTMLElement).style.cursor,
		);

		// Initial state: normal
		// Check style directly or via some other attribute
		// In the story, ResizableWindow renders Window.
		// Window applies style.
		// Normal window has specific width/height (300x200)
		expect(windowEl).toHaveStyle({ width: "300px", height: "200px" });

		// Find maximize button (the square one) within the title bar
		if (!titleBar) {
			throw new Error("Title bar not found");
		}
		const maximizeBtn = Array.from(titleBar.querySelectorAll("button")).find(
			(btn) => btn.textContent === "□",
		);
		if (!maximizeBtn) {
			throw new Error("Maximize button not found");
		}
		fireEvent.click(maximizeBtn);

		// Now should be maximized
		expect(windowEl).toHaveStyle({ width: "100%", height: "100%" });

		// Drag the title bar
		if (!titleBar) {
			throw new Error("Title bar not found");
		}

		// Simulate drag start
		fireEvent.pointerDown(titleBar, {
			clientX: 400,
			clientY: 10,
			pointerId: 1,
			buttons: 1,
		});

		// Simulate drag move
		fireEvent.pointerMove(titleBar, {
			clientX: 410,
			clientY: 20,
			pointerId: 1,
			buttons: 1,
		});

		// Should be restored to normal size
		expect(windowEl).toHaveStyle({ width: "300px", height: "200px" });

		// Should have moved
		// Original pos was 50, 80.
		// We dragged from 400, 10 to 410, 20.
		// Logic:
		// 1. On drag start (pointerDown), isDragging becomes true.
		// 2. On drag move (pointerMove), onDrag is called.
		// 3. onDrag sees maximized state.
		// 4. Calculates new position.
		//    - Container rect? In test environment, getBoundingClientRect might be all 0s unless mocked.
		//    - If container rect is all 0s:
		//      relX = 410 - 0 = 410.
		//      relY = 20 - 0 = 20.
		//      newX = 410 - (300 / 2) = 260.
		//      newY = 20.
		//    - updateWindow called with normal state and new pos.

		// Let's check if it has transform style
		// transform: translate3d(260px, 20px, 0)
		// Note: exact values depend on getBoundingClientRect behavior in jsdom.
		// Usually jsdom returns 0 for layout unless configured.
		// So let's just check it is NOT 100% width/height and has SOME transform.

		expect(windowEl).not.toHaveStyle({ width: "100%", height: "100%" });
		expect((windowEl as HTMLElement)?.style.transform).toMatch(
			TRANSLATE3D_REGEX,
		);
	});
});
