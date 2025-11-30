import { useCallback, useMemo } from "react";
import type { IconState, Position } from "../types";
import { useWindowManager } from "./useWindowManager";

export interface UseDesktopIconReturn {
	/** The icon state */
	iconState: IconState;
	/** Whether this icon is selected */
	isSelected: boolean;
	/** Select this icon (optionally with multi-select) */
	select: (multiSelect?: boolean) => void;
	/** Deselect this icon */
	deselect: () => void;
	/** Toggle selection of this icon */
	toggleSelect: () => void;
	/** Launch the associated window */
	launch: () => void;
	/** Update the icon position */
	updatePosition: (position: Position) => void;
}

/**
 * Hook to access and control a single desktop icon.
 * @throws Error if the icon with the given ID is not found
 */
export function useDesktopIcon(iconId: string): UseDesktopIconReturn {
	const {
		icons,
		selectedIconIds,
		selectIcon,
		deselectIcon,
		updateIcon,
		launchIcon,
	} = useWindowManager();

	const iconState = useMemo(() => {
		const icon = icons.find((i) => i.id === iconId);
		if (!icon) {
			throw new Error(`Icon with id "${iconId}" not found`);
		}
		return icon;
	}, [icons, iconId]);

	const isSelected = useMemo(
		() => selectedIconIds.includes(iconId),
		[selectedIconIds, iconId],
	);

	const select = useCallback(
		(multiSelect = false) => {
			selectIcon(iconId, multiSelect);
		},
		[selectIcon, iconId],
	);

	const deselect = useCallback(() => {
		deselectIcon(iconId);
	}, [deselectIcon, iconId]);

	const toggleSelect = useCallback(() => {
		if (isSelected) {
			deselectIcon(iconId);
		} else {
			selectIcon(iconId, true);
		}
	}, [isSelected, selectIcon, deselectIcon, iconId]);

	const launch = useCallback(() => {
		launchIcon(iconId);
	}, [launchIcon, iconId]);

	const updatePosition = useCallback(
		(position: Position) => {
			updateIcon(iconId, { position });
		},
		[updateIcon, iconId],
	);

	return {
		iconState,
		isSelected,
		select,
		deselect,
		toggleSelect,
		launch,
		updatePosition,
	};
}
