import type {
	IconState,
	Position,
	Size,
	WindowConfig,
	WindowState,
} from "../types";
import { generateWindowId } from "../utils/id";

const LEADING_SLASH_REGEX = /^\//;

/**
 * Definition for a single window type.
 * Provides a single source of truth for window, icon, and routing configuration.
 */
export interface WindowDefinition {
	/** Window title */
	title: string;
	/** Default window position */
	defaultPosition: Position;
	/** Default window size */
	defaultSize: Size;
	/** URL path for routing (optional) */
	path?: string;
	/** Desktop icon configuration (optional) */
	icon?: {
		/** Display label for the icon (defaults to title) */
		label?: string;
		/** Consumer-defined icon identifier (e.g., icon name or URL) */
		iconKey?: string;
		/** Default position on desktop */
		position?: Position;
	};
	/** Props to pass to the component */
	defaultProps?: Record<string, unknown>;
}

/**
 * Result of calling defineWindows().
 * Provides type-safe methods to derive various configurations from a single source of truth.
 */
export interface WindowDefinitions<
	TIds extends string = string,
	TDefs extends Record<TIds, WindowDefinition> = Record<TIds, WindowDefinition>,
> {
	/** The raw definitions object */
	readonly definitions: TDefs;
	/** Array of all component IDs */
	readonly ids: TIds[];

	/**
	 * Get a WindowState object for opening a window.
	 * @param id - The component ID
	 * @param overrides - Optional overrides for the window state
	 */
	getWindowState(
		id: TIds,
		overrides?: Partial<Omit<WindowState, "id" | "componentId">>,
	): WindowState;

	/**
	 * Get a WindowConfig object suitable for openWindow().
	 * @param id - The component ID
	 * @param overrides - Optional overrides for the config
	 */
	getWindowConfig(
		id: TIds,
		overrides?: Partial<Omit<WindowConfig, "id" | "componentId">>,
	): WindowConfig;

	/**
	 * Get all IconState configurations for windows that have icons defined.
	 */
	getIconConfigs(): IconState[];

	/**
	 * Get a single icon config by component ID.
	 * Returns undefined if no icon is defined for that component.
	 */
	getIconConfig(id: TIds): IconState | undefined;

	/**
	 * Get the path map for routing.
	 * Maps component ID to URL path.
	 */
	getPathMap(): Partial<Record<TIds, string>>;

	/**
	 * Get the reverse path map (path to component ID).
	 * Useful for determining which window to open from a URL.
	 */
	getPathToIdMap(): Record<string, TIds>;

	/**
	 * Get valid slugs for static site generation.
	 * Returns paths without leading slash, excluding root "/".
	 */
	getValidSlugs(): string[];

	/**
	 * Get component ID from a URL path.
	 * Returns undefined if no match found.
	 */
	getIdFromPath(path: string): TIds | undefined;

	/**
	 * Check if a component ID exists in the definitions.
	 */
	has(id: string): id is TIds;
}

/**
 * Create a unified window definitions object.
 *
 * @example
 * ```typescript
 * const windows = defineWindows({
 *   home: {
 *     title: 'Home',
 *     defaultPosition: { x: 150, y: 80 },
 *     defaultSize: { width: '90vw', height: 400 },
 *     path: '/',
 *     icon: { label: 'Home', iconKey: 'home', position: { x: 20, y: 20 } },
 *   },
 *   about: {
 *     title: 'About',
 *     defaultPosition: { x: 200, y: 120 },
 *     defaultSize: { width: 480, height: 380 },
 *     path: '/about',
 *     icon: { label: 'About', iconKey: 'about', position: { x: 20, y: 120 } },
 *   },
 * });
 *
 * // Usage:
 * windows.getWindowState('home');  // WindowState for opening
 * windows.getIconConfigs();        // All IconState[]
 * windows.getPathMap();            // { home: '/', about: '/about' }
 * windows.getValidSlugs();         // ['about']
 * ```
 */
export function defineWindows<
	TDefs extends Record<string, WindowDefinition>,
	TIds extends Extract<keyof TDefs, string> = Extract<keyof TDefs, string>,
>(definitions: TDefs): WindowDefinitions<TIds, TDefs> {
	const ids = Object.keys(definitions) as TIds[];

	// Pre-compute path mappings
	const pathMap: Partial<Record<TIds, string>> = {};
	const pathToIdMap: Record<string, TIds> = {};

	for (const id of ids) {
		const def = definitions[id];
		if (def.path !== undefined) {
			pathMap[id] = def.path;
			pathToIdMap[def.path] = id;
		}
	}

	return {
		definitions,
		ids,

		getWindowState(
			id: TIds,
			overrides?: Partial<Omit<WindowState, "id" | "componentId">>,
		): WindowState {
			const def = definitions[id];
			if (!def) {
				throw new Error(`Unknown window definition: ${id}`);
			}

			return {
				id: id,
				title: overrides?.title ?? def.title,
				componentId: id,
				position: overrides?.position ?? def.defaultPosition,
				size: overrides?.size ?? def.defaultSize,
				zIndex: overrides?.zIndex ?? 1,
				displayState: overrides?.displayState ?? "normal",
				componentProps: overrides?.componentProps ?? def.defaultProps,
				previousBounds: overrides?.previousBounds,
			};
		},

		getWindowConfig(
			id: TIds,
			overrides?: Partial<Omit<WindowConfig, "id" | "componentId">>,
		): WindowConfig {
			const def = definitions[id];
			if (!def) {
				throw new Error(`Unknown window definition: ${id}`);
			}

			return {
				id: generateWindowId(),
				title: overrides?.title ?? def.title,
				componentId: id,
				position: overrides?.position ?? def.defaultPosition,
				size: overrides?.size ?? def.defaultSize,
				componentProps: overrides?.componentProps ?? def.defaultProps,
			};
		},

		getIconConfigs(): IconState[] {
			const icons: IconState[] = [];

			for (const id of ids) {
				const def = definitions[id];
				if (def.icon) {
					icons.push({
						id: `icon-${id}`,
						label: def.icon.label ?? def.title,
						componentId: id,
						position: def.icon.position ?? {
							x: 20,
							y: 20 + icons.length * 100,
						},
						icon: def.icon.iconKey,
						componentProps: def.defaultProps,
					});
				}
			}

			return icons;
		},

		getIconConfig(id: TIds): IconState | undefined {
			const def = definitions[id];
			if (!def?.icon) {
				return undefined;
			}

			return {
				id: `icon-${id}`,
				label: def.icon.label ?? def.title,
				componentId: id,
				position: def.icon.position ?? { x: 20, y: 20 },
				icon: def.icon.iconKey,
				componentProps: def.defaultProps,
			};
		},

		getPathMap(): Partial<Record<TIds, string>> {
			return { ...pathMap };
		},

		getPathToIdMap(): Record<string, TIds> {
			return { ...pathToIdMap };
		},

		getValidSlugs(): string[] {
			const slugs: string[] = [];

			for (const id of ids) {
				const def = definitions[id];
				if (def.path && def.path !== "/") {
					// Remove leading slash for slug
					slugs.push(def.path.replace(LEADING_SLASH_REGEX, ""));
				}
			}

			return slugs;
		},

		getIdFromPath(path: string): TIds | undefined {
			// Normalize path to have leading slash
			const normalizedPath = path.startsWith("/") ? path : `/${path}`;
			return pathToIdMap[normalizedPath];
		},

		has(id: string): id is TIds {
			return id in definitions;
		},
	};
}
