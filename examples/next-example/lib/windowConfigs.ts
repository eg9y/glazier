import type { IconState, WindowState } from "glazier";

/**
 * Window configurations for the desktop.
 * Each key maps to a route (e.g., "home" → "/", "about" → "/about").
 */
export const windowConfigs: Record<string, WindowState> = {
	home: {
		id: "home",
		title: "Home",
		componentId: "home",
		position: { x: 150, y: 80 },
		size: { width: 500, height: 400 },
		zIndex: 1,
		displayState: "normal",
	},
	about: {
		id: "about",
		title: "About",
		componentId: "about",
		position: { x: 200, y: 120 },
		size: { width: 480, height: 380 },
		zIndex: 1,
		displayState: "normal",
	},
	contact: {
		id: "contact",
		title: "Contact",
		componentId: "contact",
		position: { x: 250, y: 160 },
		size: { width: 450, height: 350 },
		zIndex: 1,
		displayState: "normal",
	},
};

/**
 * Desktop icon configurations.
 * Icons can be double-clicked to open their associated windows.
 */
export const iconConfigs: IconState[] = [
	{
		id: "icon-home",
		label: "Home",
		componentId: "home",
		position: { x: 20, y: 20 },
		icon: "home",
	},
	{
		id: "icon-about",
		label: "About",
		componentId: "about",
		position: { x: 20, y: 120 },
		icon: "about",
	},
	{
		id: "icon-contact",
		label: "Contact",
		componentId: "contact",
		position: { x: 20, y: 220 },
		icon: "contact",
	},
];

/**
 * Valid route slugs for static generation.
 */
export const validSlugs = Object.keys(windowConfigs);

/**
 * Get window config by slug, with fallback to home.
 */
export function getWindowConfig(slug: string): WindowState {
	return windowConfigs[slug] ?? windowConfigs.home;
}
