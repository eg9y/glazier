import type { CSSProperties } from "react";
import type { SnapZone } from "../hooks/useWindowDrag";

export interface SnapPreviewOverlayProps {
	/** The currently active snap zone, or null if none */
	zone: SnapZone | null;
	/** Custom styles to apply to the overlay */
	style?: CSSProperties;
}

export function SnapPreviewOverlay({ zone, style }: SnapPreviewOverlayProps) {
	if (!zone) {
		return null;
	}

	const baseStyle: CSSProperties = {
		position: "absolute",
		backgroundColor: "rgba(0, 120, 215, 0.2)",
		border: "2px dashed rgba(0, 120, 215, 0.6)",
		boxSizing: "border-box",
		pointerEvents: "none",
		zIndex: 9999,
		transition: "opacity 150ms ease-in-out",
		...style,
	};

	const getPositionStyle = (): CSSProperties => {
		switch (zone) {
			case "left":
				return { top: 0, bottom: 0, left: 0, width: "50%" };
			case "right":
				return { top: 0, bottom: 0, right: 0, width: "50%" };
			case "top":
				return { top: 0, left: 0, right: 0, bottom: 0 };
		}
	};

	return <div style={{ ...baseStyle, ...getPositionStyle() }} />;
}
