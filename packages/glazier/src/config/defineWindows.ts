import type {
	IconState,
	Position,
	Size,
	WindowConfig,
	WindowState,
} from "../types";
import { generateWindowId } from "../utils/id";

const LEADING_SLASH_REGEX = /^\//;

export interface WindowDefinition {
	title: string;
	defaultPosition: Position;
	defaultSize: Size;
	path?: string;
	icon?: {
		label?: string;
		iconKey?: string;
		position?: Position;
	};
	defaultProps?: Record<string, unknown>;
}

export interface WindowDefinitions<
	TIds extends string = string,
	TDefs extends Record<TIds, WindowDefinition> = Record<TIds, WindowDefinition>,
> {
	readonly definitions: TDefs;
	readonly ids: TIds[];
	getWindowState(
		id: TIds,
		overrides?: Partial<Omit<WindowState, "id" | "componentId">>,
	): WindowState;
	getWindowConfig(
		id: TIds,
		overrides?: Partial<Omit<WindowConfig, "id" | "componentId">>,
	): WindowConfig;
	getIconConfigs(): IconState[];
	getIconConfig(id: TIds): IconState | undefined;
	getPathMap(): Partial<Record<TIds, string>>;
	getPathToIdMap(): Record<string, TIds>;
	/** Returns paths without leading slash, excluding root "/" */
	getValidSlugs(): string[];
	getIdFromPath(path: string): TIds | undefined;
	has(id: string): id is TIds;
}

export function defineWindows<
	TDefs extends Record<string, WindowDefinition>,
	TIds extends Extract<keyof TDefs, string> = Extract<keyof TDefs, string>,
>(definitions: TDefs): WindowDefinitions<TIds, TDefs> {
	const ids = Object.keys(definitions) as TIds[];

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
					slugs.push(def.path.replace(LEADING_SLASH_REGEX, ""));
				}
			}

			return slugs;
		},

		getIdFromPath(path: string): TIds | undefined {
			const normalizedPath = path.startsWith("/") ? path : `/${path}`;
			return pathToIdMap[normalizedPath];
		},

		has(id: string): id is TIds {
			return id in definitions;
		},
	};
}
