import type React from "react";
import { useCallback, useMemo } from "react";
import type { WindowConfig, WindowState } from "../types";
import { useWindowManager } from "./useWindowManager";

export interface UseIconLauncherOptions {
	iconId: string;
	getWindowConfig?: (componentId: string) => WindowConfig | undefined;
}

export interface UseIconLauncherReturn {
	launch: () => void;
	isWindowOpen: boolean;
	existingWindow: WindowState | undefined;
	launchProps: {
		onDoubleClick: (e: React.MouseEvent) => void;
	};
}

export function useIconLauncher(
	options: UseIconLauncherOptions,
): UseIconLauncherReturn {
	const { iconId, getWindowConfig } = options;
	const { icons, state, openWindow, focusWindow, restoreWindow, launchIcon } =
		useWindowManager();

	const icon = useMemo(
		() => icons.find((i) => i.id === iconId),
		[icons, iconId],
	);

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
			if (existingWindow.displayState === "minimized") {
				restoreWindow(existingWindow.id);
			} else {
				focusWindow(existingWindow.id);
			}
		} else if (getWindowConfig) {
			const config = getWindowConfig(icon.componentId);
			if (config) {
				openWindow(config);
			}
		} else {
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
