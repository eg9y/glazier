import { defineWindows } from "glazier/server";

/**
 * Unified window definitions using defineWindows.
 * Single source of truth for window configs, icon configs, and routing paths.
 */
export const windows = defineWindows({
	home: {
		title: "Home",
		defaultPosition: { x: 150, y: 80 },
		defaultSize: { width: "90vw", height: 400 },
		path: "/",
		icon: {
			label: "Home",
			iconKey: "home",
			position: { x: 20, y: 20 },
		},
	},
	about: {
		title: "About",
		defaultPosition: { x: 200, y: 120 },
		defaultSize: { width: 480, height: 380 },
		path: "/about",
		icon: {
			label: "About",
			iconKey: "about",
			position: { x: 20, y: 120 },
		},
	},
	contact: {
		title: "Contact",
		defaultPosition: { x: 250, y: 160 },
		defaultSize: { width: 450, height: 350 },
		path: "/contact",
		icon: {
			label: "Contact",
			iconKey: "contact",
			position: { x: 20, y: 220 },
		},
	},
});

// Export type for component IDs
export type WindowComponentId = (typeof windows.ids)[number];

/**
 * Valid route slugs for static generation.
 */
export const validSlugs = windows.getValidSlugs();

// Legacy exports for backwards compatibility during migration
// These can be removed once fully migrated to defineWindows
export const windowConfigs = Object.fromEntries(
	windows.ids.map((id) => [id, windows.getWindowState(id)]),
);
export const iconConfigs = windows.getIconConfigs();
export const pathMap = windows.getPathMap();

/**
 * Get window config by slug, with fallback to home.
 */
export function getWindowConfig(slug: string) {
	if (windows.has(slug)) {
		return windows.getWindowState(slug as WindowComponentId);
	}
	return windows.getWindowState("home");
}
