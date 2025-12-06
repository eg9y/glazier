"use client";

import { useWindowManager, toCSSValue } from "glazier";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";

const ANIMATION_DURATION = 250;

interface AnimatedWindowProps {
	id: string;
	children: ReactNode;
	className?: string;
	style?: CSSProperties;
}

/**
 * Animated window wrapper that provides open/close animations.
 * Uses CSS keyframe animations for smooth open/close effects.
 */
export function AnimatedWindow({
	id,
	children,
	className,
	style,
}: AnimatedWindowProps) {
	const { state, focusWindow, closingWindowIds, finalizeClose } =
		useWindowManager();
	const windowState = state.windows.find((w) => w.id === id);
	const isClosing = closingWindowIds.has(id);
	const [removed, setRemoved] = useState(false);

	// Handle close animation completion
	useEffect(() => {
		if (isClosing) {
			const timer = setTimeout(() => {
				setRemoved(true);
				finalizeClose(id);
			}, ANIMATION_DURATION);
			return () => clearTimeout(timer);
		}
	}, [isClosing, id, finalizeClose]);

	if (!windowState || removed) {
		return null;
	}

	const { position, size, zIndex, displayState, animationSource } = windowState;

	if (displayState === "minimized") {
		return null;
	}

	const isMaximized = displayState === "maximized";
	const sourceX = animationSource?.x ?? 0;
	const sourceY = animationSource?.y ?? 0;
	const targetX = position.x;
	const targetY = position.y;

	// Calculate scale factors for the animation
	const targetWidth = isMaximized ? "100vw" : toCSSValue(size.width);
	const targetHeight = isMaximized ? "100vh" : toCSSValue(size.height);

	const windowStyle: CSSProperties = {
		position: "absolute",
		top: 0,
		left: 0,
		width: targetWidth,
		height: targetHeight,
		zIndex,
		overflow: "hidden",
		transformOrigin: "top left",
		// Use CSS custom properties for animation
		"--source-x": `${sourceX}px`,
		"--source-y": `${sourceY}px`,
		"--target-x": `${targetX}px`,
		"--target-y": `${targetY}px`,
		animation: isClosing
			? `windowClose ${ANIMATION_DURATION}ms ease-out forwards`
			: `windowOpen ${ANIMATION_DURATION}ms ease-out forwards`,
		...style,
	} as CSSProperties;

	return (
		<>
			<style>{`
				@keyframes windowOpen {
					from {
						transform: translate3d(var(--source-x), var(--source-y), 0) scale(0.1);
						opacity: 0;
					}
					to {
						transform: translate3d(var(--target-x), var(--target-y), 0) scale(1);
						opacity: 1;
					}
				}
				@keyframes windowClose {
					from {
						transform: translate3d(var(--target-x), var(--target-y), 0) scale(1);
						opacity: 1;
					}
					to {
						transform: translate3d(var(--source-x), var(--source-y), 0) scale(0.1);
						opacity: 0;
					}
				}
			`}</style>
			<div
				style={windowStyle}
				className={className}
				onPointerDown={() => focusWindow(id)}
			>
				{children}
			</div>
		</>
	);
}
