import { type CSSProperties, Fragment, type ReactNode } from "react";
import type { ComponentType } from "react";
import { useWindowManager } from "../hooks/useWindowManager";
import { type WindowState, isRegistryWindowState } from "../types";

export interface DesktopRenderProps {
	/** The window ID */
	windowId: string;
	/** The resolved component from the registry */
	component: ComponentType<{ windowId: string } & Record<string, unknown>>;
	/** The component props from window state */
	componentProps: Record<string, unknown>;
	/** The full window state */
	windowState: WindowState;
}

export interface DesktopProps {
	/**
	 * Render function for each window. Receives the resolved component and window state.
	 * Use this to wrap components with your custom Window chrome (title bar, resize handles, etc).
	 */
	children: (props: DesktopRenderProps) => ReactNode;
	/** Optional className for the desktop container */
	className?: string;
	/** Optional styles for the desktop container */
	style?: CSSProperties;
}

/**
 * Desktop component that auto-renders windows from the registry.
 *
 * Only renders windows that have a `componentId` field. Windows without
 * `componentId` should be rendered manually using the `<Window>` component.
 *
 * @example
 * ```tsx
 * <Desktop>
 *   {({ component: Component, windowId, componentProps, windowState }) => (
 *     <Window id={windowId}>
 *       <TitleBar title={windowState.title} />
 *       <Component windowId={windowId} {...componentProps} />
 *     </Window>
 *   )}
 * </Desktop>
 * ```
 */
export function Desktop({ children, className, style }: DesktopProps) {
	const { state, registry } = useWindowManager();

	if (!registry) {
		if (process.env.NODE_ENV !== "production") {
			// biome-ignore lint/suspicious/noConsole: Dev-only warning for missing registry
			console.warn(
				"Desktop: No registry provided to WindowManagerProvider. " +
					"Desktop requires a registry to resolve componentId to components.",
			);
		}
		return null;
	}

	const registryWindows = state.windows.filter(isRegistryWindowState);

	return (
		<div className={className} style={style}>
			{registryWindows.map((windowState) => {
				const Component = registry[windowState.componentId];

				if (!Component) {
					if (process.env.NODE_ENV !== "production") {
						// biome-ignore lint/suspicious/noConsole: Dev-only warning for missing componentId
						console.warn(
							`Desktop: componentId "${windowState.componentId}" not found in registry. ` +
								`Available keys: ${Object.keys(registry).join(", ")}`,
						);
					}
					return null;
				}

				return (
					<Fragment key={windowState.id}>
						{children({
							windowId: windowState.id,
							component: Component,
							componentProps: windowState.componentProps ?? {},
							windowState,
						})}
					</Fragment>
				);
			})}
		</div>
	);
}
