import type React from "react";
import { useCallback, useMemo } from "react";
import type { WindowConfig, WindowState } from "../types";
import { useWindowManager } from "./useWindowManager";

export interface UseIconLauncherOptions {
	/** The icon ID to launch from */
	iconId: string;
	/**
	 * Optional function to get window config for a componentId.
	 * If not provided, uses the icon's properties and defaultWindowConfigs from provider.
	 */
	getWindowConfig?: (componentId: string) => WindowConfig | undefined;
}

export interface UseIconLauncherReturn {
	/** Launch the window (open new or focus existing) */
	launch: () => void;
	/** Whether a window with this componentId is already open */
	isWindowOpen: boolean;
	/** The existing window state if open */
	existingWindow: WindowState | undefined;
	/** Props to spread on the icon element for double-click handling */
	launchProps: {
		onDoubleClick: (e: React.MouseEvent) => void;
	};
}

/**
 * Hook that abstracts the "open or focus existing window" pattern for desktop icons.
 *
 * This hook handles the common desktop pattern where double-clicking an icon either:
 * - Opens a new window if none exists for that component
 * - Focuses the existing window if one is already open
 * - Restores a minimized window and focuses it
 *
 * @example
 * ```tsx
 * function DesktopIcon({ iconId }) {
 *   const { launchProps, isWindowOpen } = useIconLauncher({ iconId });
 *   const { iconState, dragProps } = useDesktopIcon(iconId);
 *
 *   return (
 *     <div {...dragProps} {...launchProps}>
 *       <Icon name={iconState.icon} active={isWindowOpen} />
 *       <span>{iconState.label}</span>
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // With custom window config
 * const { launch } = useIconLauncher({
 *   iconId: 'my-icon',
 *   getWindowConfig: (componentId) => ({
 *     id: generateWindowId(),
 *     title: 'Custom Title',
 *     componentId,
 *     position: { x: 200, y: 200 },
 *     size: { width: 600, height: 400 },
 *   }),
 * });
 * ```
 */
export function useIconLauncher(
	options: UseIconLauncherOptions,
): UseIconLauncherReturn {
	const { iconId, getWindowConfig } = options;
	const { icons, state, openWindow, focusWindow, restoreWindow, launchIcon } =
		useWindowManager();

	// Find the icon
	const icon = useMemo(
		() => icons.find((i) => i.id === iconId),
		[icons, iconId],
	);

	// Find existing window for this icon's componentId
	const existingWindow = useMemo(
		() =>
			icon
				? state.windows.find((w) => w.componentId === icon.componentId)
				: undefined,
		[state.windows, icon],
	);

	const isWindowOpen = existingWindow !== undefined;

	const launch = useCallback(() => {
		if (!icon) {
			return;
		}

		if (existingWindow) {
			// Window exists - restore if minimized, otherwise focus
			if (existingWindow.displayState === "minimized") {
				restoreWindow(existingWindow.id);
			} else {
				focusWindow(existingWindow.id);
			}
		} else if (getWindowConfig) {
			// Custom config provided
			const config = getWindowConfig(icon.componentId);
			if (config) {
				openWindow(config);
			}
		} else {
			// Use built-in launchIcon which uses defaultWindowConfigs
			launchIcon(iconId);
		}
	}, [
		icon,
		iconId,
		existingWindow,
		getWindowConfig,
		openWindow,
		focusWindow,
		restoreWindow,
		launchIcon,
	]);

	const launchProps = useMemo(
		() => ({
			onDoubleClick: (e: React.MouseEvent) => {
				e.stopPropagation();
				launch();
			},
		}),
		[launch],
	);

	return {
		launch,
		isWindowOpen,
		existingWindow,
		launchProps,
	};
}
