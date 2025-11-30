import type { Size, SizeValue } from "../types";

/**
 * Type guard to check if a SizeValue is a numeric pixel value.
 */
export function isNumericSize(value: SizeValue): value is number {
	return typeof value === "number";
}

/**
 * Converts a SizeValue to a CSS-compatible string.
 * - Numbers are treated as pixels and get "px" appended
 * - Strings are passed through directly (assumed to be valid CSS)
 */
export function toCSSValue(value: SizeValue): string {
	if (typeof value === "number") {
		return `${value}px`;
	}
	return value;
}

/**
 * Resolves a Size to pixel values using getComputedStyle.
 * This is needed for operations that require numeric values (resize, snap, bounds).
 *
 * @param element - The DOM element to measure (must have the size applied)
 * @returns Size with numeric pixel values
 */
export function resolveToPixels(element: HTMLElement): {
	width: number;
	height: number;
} {
	const computed = window.getComputedStyle(element);
	return {
		width: Number.parseFloat(computed.width) || 0,
		height: Number.parseFloat(computed.height) || 0,
	};
}

/**
 * Resolves a single SizeValue to pixels given a reference element and property.
 * Useful when you need to resolve a CSS value before the element has that size applied.
 *
 * @param value - The SizeValue to resolve
 * @param container - Container element for percentage/viewport calculations
 * @param property - Which dimension ('width' or 'height')
 * @returns Numeric pixel value
 */
export function resolveSizeValueToPixels(
	value: SizeValue,
	container: HTMLElement,
	property: "width" | "height",
): number {
	if (typeof value === "number") {
		return value;
	}

	// Create a temporary element to resolve the CSS value
	const temp = document.createElement("div");
	temp.style.position = "absolute";
	temp.style.visibility = "hidden";
	temp.style[property] = value;

	// Append to the container for proper % resolution
	container.appendChild(temp);
	const computed =
		Number.parseFloat(window.getComputedStyle(temp)[property]) || 0;
	container.removeChild(temp);

	return computed;
}

/**
 * Creates a Size object from pixel values.
 * Useful after resize operations that produce numeric results.
 */
export function createPixelSize(width: number, height: number): Size {
	return { width, height };
}
