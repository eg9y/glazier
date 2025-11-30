import type { ReactNode } from "react";
import { useWindowManager } from "../hooks/useWindowManager";
import type { WindowState } from "../types";

export interface TaskbarRenderProps {
	windows: WindowState[];
	activeWindowId: string | null;
	focusWindow: (id: string) => void;
	minimizeWindow: (id: string) => void;
	restoreWindow: (id: string) => void;
	closeWindow: (id: string) => void;
}

export interface TaskbarProps {
	children: (props: TaskbarRenderProps) => ReactNode;
}

export function Taskbar({ children }: TaskbarProps) {
	const { state, focusWindow, minimizeWindow, restoreWindow, closeWindow } =
		useWindowManager();

	return (
		<>
			{children({
				windows: state.windows,
				activeWindowId: state.activeWindowId,
				focusWindow,
				minimizeWindow,
				restoreWindow,
				closeWindow,
			})}
		</>
	);
}
