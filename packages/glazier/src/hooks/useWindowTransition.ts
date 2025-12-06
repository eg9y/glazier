import { useCallback, useState } from "react";

export interface WindowTransitionState {
	/** True when the window is being dragged */
	isDragging: boolean;
	/** True when the window is being resized */
	isResizing: boolean;
	/** True when the window is transitioning to a snap zone */
	isSnapping: boolean;
}

export interface UseWindowTransitionReturn extends WindowTransitionState {
	/** Set the dragging state */
	setIsDragging: (value: boolean) => void;
	/** Set the resizing state */
	setIsResizing: (value: boolean) => void;
	/** Set the snapping state */
	setIsSnapping: (value: boolean) => void;
}

/**
 * Hook for tracking window transition states for animation integration.
 *
 * This hook provides state flags that indicate when a window is being
 * dragged, resized, or snapping to a zone. Use these states to trigger
 * animations with libraries like Framer Motion.
 *
 * @example
 * ```tsx
 * function AnimatedWindow({ id, children }) {
 *   const { isDragging, isSnapping } = useWindowTransition();
 *
 *   return (
 *     <Window id={id}>
 *       <motion.div
 *         animate={{
 *           scale: isDragging ? 1.02 : 1,
 *           transition: { duration: isSnapping ? 0.2 : 0 }
 *         }}
 *       >
 *         {children}
 *       </motion.div>
 *     </Window>
 *   );
 * }
 * ```
 */
export function useWindowTransition(): UseWindowTransitionReturn {
	const [isDragging, setIsDragging] = useState(false);
	const [isResizing, setIsResizing] = useState(false);
	const [isSnapping, setIsSnapping] = useState(false);

	const handleSetIsDragging = useCallback((value: boolean) => {
		setIsDragging(value);
	}, []);

	const handleSetIsResizing = useCallback((value: boolean) => {
		setIsResizing(value);
	}, []);

	const handleSetIsSnapping = useCallback((value: boolean) => {
		setIsSnapping(value);
	}, []);

	return {
		isDragging,
		isResizing,
		isSnapping,
		setIsDragging: handleSetIsDragging,
		setIsResizing: handleSetIsResizing,
		setIsSnapping: handleSetIsSnapping,
	};
}
