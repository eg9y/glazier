/**
 * Server-safe exports for Glazier.
 *
 * These exports can be safely used in Server Components and other
 * non-React contexts. They don't use React hooks or client-side APIs.
 *
 * @example
 * ```ts
 * // In a Next.js Server Component or API route
 * import { defineWindows } from 'glazier/server';
 *
 * export const windows = defineWindows({
 *   home: { title: 'Home', ... },
 * });
 * ```
 */

// Config utilities (no React dependencies)
export { defineWindows } from "../config";
export type { WindowDefinition, WindowDefinitions } from "../config";

// Type exports (safe for server)
export type {
	Position,
	Size,
	SizeValue,
	WindowState,
	WindowConfig,
	WindowDisplayState,
	ResizeDirection,
	IconState,
	IconConfig,
	GridConfig,
} from "../types";

// Routing types (interfaces only)
export type { RoutingAdapter } from "../routing";
