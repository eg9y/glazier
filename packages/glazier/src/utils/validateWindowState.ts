import {
	type WindowRegistry,
	type WindowState,
	isRegistryWindowState,
} from "../types";

export interface ValidationResult {
	/** Windows with valid componentIds (or no componentId) */
	valid: WindowState[];
	/** Windows with invalid componentIds and the reason */
	invalid: Array<{
		window: WindowState & { componentId: string };
		reason: string;
	}>;
}

/**
 * Validates window states against a registry.
 * Filters out windows with componentIds that don't exist in the registry.
 *
 * @param windows - Array of window states to validate
 * @param registry - The component registry to validate against
 * @returns Object with valid windows and invalid windows with reasons
 *
 * @example
 * ```tsx
 * // Hydrating from localStorage
 * const savedState = JSON.parse(localStorage.getItem('windows') || '[]');
 * const { valid, invalid } = validateWindowState(savedState, registry);
 * if (invalid.length > 0) {
 *   console.warn('Some windows could not be restored:', invalid);
 * }
 * // Use `valid` as defaultWindows
 * ```
 */
export function validateWindowState(
	windows: WindowState[],
	registry: WindowRegistry,
): ValidationResult {
	const valid: WindowState[] = [];
	const invalid: ValidationResult["invalid"] = [];

	for (const window of windows) {
		if (!isRegistryWindowState(window)) {
			// Non-registry windows are always valid
			valid.push(window);
			continue;
		}

		if (!(window.componentId in registry)) {
			invalid.push({
				window,
				reason: `componentId "${window.componentId}" not found in registry. Available: ${Object.keys(registry).join(", ") || "(empty registry)"}`,
			});
			continue;
		}

		valid.push(window);
	}

	return { valid, invalid };
}
