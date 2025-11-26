// Types
export type {
	Position,
	Size,
	WindowState,
	WindowManagerState,
	WindowConfig,
} from "./types";

// Context
export { WindowManagerContext } from "./context/WindowManagerContext";
export type { WindowManagerContextValue } from "./context/WindowManagerContext";

// Components
export { WindowManagerProvider } from "./components/WindowManagerProvider";
export type { WindowManagerProviderProps } from "./components/WindowManagerProvider";
export { Window } from "./components/Window";
export type { WindowProps } from "./components/Window";

// Hooks
export { useWindowManager } from "./hooks/useWindowManager";
export { useDrag } from "./hooks/useDrag";
export type { UseDragOptions, UseDragReturn } from "./hooks/useDrag";

// Utils
export { generateWindowId } from "./utils/id";
