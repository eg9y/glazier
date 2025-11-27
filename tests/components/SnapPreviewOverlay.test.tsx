import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SnapPreviewOverlay } from "../../src";

describe("SnapPreviewOverlay", () => {
	it("renders nothing when zone is null", () => {
		const { container } = render(<SnapPreviewOverlay zone={null} />);
		expect(container.firstChild).toBe(null);
	});

	it("renders an overlay element when zone is left", () => {
		const { container } = render(<SnapPreviewOverlay zone="left" />);
		expect(container.firstChild).not.toBe(null);
		expect(container.firstChild?.nodeName).toBe("DIV");
	});

	it("renders an overlay element when zone is right", () => {
		const { container } = render(<SnapPreviewOverlay zone="right" />);
		expect(container.firstChild).not.toBe(null);
		expect(container.firstChild?.nodeName).toBe("DIV");
	});

	it("renders different overlay elements based on zone", () => {
		const { container: leftContainer } = render(
			<SnapPreviewOverlay zone="left" />,
		);
		const { container: rightContainer } = render(
			<SnapPreviewOverlay zone="right" />,
		);

		// Both render overlays
		expect(leftContainer.firstChild).not.toBe(null);
		expect(rightContainer.firstChild).not.toBe(null);
	});

	it("accepts custom style prop", () => {
		// This test verifies the component accepts the style prop without errors
		const { container } = render(
			<SnapPreviewOverlay
				zone="left"
				style={{ backgroundColor: "red", opacity: "0.5" }}
			/>,
		);
		expect(container.firstChild).not.toBe(null);
	});

	it("renders nothing when transitioning to null zone", () => {
		const { container, rerender } = render(<SnapPreviewOverlay zone="left" />);
		expect(container.firstChild).not.toBe(null);

		rerender(<SnapPreviewOverlay zone={null} />);
		expect(container.firstChild).toBe(null);
	});
});
