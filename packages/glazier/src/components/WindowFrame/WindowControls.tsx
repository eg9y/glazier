import type { CSSProperties, JSX, ReactNode } from "react";
import { useWindowFrame } from "./WindowFrameContext";

export type WindowControlType = "minimize" | "maximize" | "close";

export interface WindowControlsProps {
	/** Additional class name for the container */
	className?: string;
	/** Additional styles for the container */
	style?: CSSProperties;
	/** Which controls to show (default: all) */
	controls?: WindowControlType[];
	/** Custom icons for each control */
	icons?: {
		minimize?: ReactNode;
		maximize?: ReactNode;
		restore?: ReactNode;
		close?: ReactNode;
	};
	/** Class name for individual buttons */
	buttonClassName?: string;
	/** Styles for individual buttons */
	buttonStyle?: CSSProperties;
	/** Class name for close button (merged with buttonClassName) */
	closeButtonClassName?: string;
}

// Default icons
function MinimizeIcon() {
	return (
		<svg
			className="h-4 w-4"
			width="16"
			height="16"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			aria-label="Minimize"
			role="img"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M20 12H4"
			/>
		</svg>
	);
}

function MaximizeIcon() {
	return (
		<svg
			className="h-4 w-4"
			width="16"
			height="16"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			aria-label="Maximize"
			role="img"
		>
			<rect x="4" y="4" width="16" height="16" strokeWidth={2} rx="1" />
		</svg>
	);
}

function RestoreIcon() {
	return (
		<svg
			className="h-4 w-4"
			width="16"
			height="16"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			aria-label="Restore"
			role="img"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M8 4h12v12"
			/>
			<rect x="4" y="8" width="12" height="12" strokeWidth={2} rx="1" />
		</svg>
	);
}

function CloseIcon() {
	return (
		<svg
			className="h-4 w-4"
			width="16"
			height="16"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			aria-label="Close"
			role="img"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M6 18L18 6M6 6l12 12"
			/>
		</svg>
	);
}

/**
 * Pre-built window control buttons (minimize, maximize/restore, close).
 *
 * @example
 * ```tsx
 * // Basic usage with defaults
 * <WindowControls />
 *
 * // With custom styling
 * <WindowControls
 *   className="flex gap-1"
 *   buttonClassName="rounded p-1 text-slate-400 hover:bg-slate-700 hover:text-white"
 *   closeButtonClassName="hover:bg-red-600"
 * />
 *
 * // Only some controls
 * <WindowControls controls={['minimize', 'close']} />
 *
 * // Custom icons
 * <WindowControls
 *   icons={{
 *     minimize: <MinusIcon />,
 *     maximize: <ExpandIcon />,
 *     close: <XIcon />,
 *   }}
 * />
 * ```
 */
export function WindowControls({
	className,
	style,
	controls = ["minimize", "maximize", "close"],
	icons,
	buttonClassName,
	buttonStyle,
	closeButtonClassName,
}: WindowControlsProps): JSX.Element {
	const { close, minimize, maximize, restore, displayState } = useWindowFrame();

	const isMaximized = displayState === "maximized";

	return (
		<div
			className={className}
			style={{ display: "flex", gap: "4px", ...style }}
			onPointerDown={(e) => e.stopPropagation()}
		>
			{controls.includes("minimize") && (
				<button
					type="button"
					onClick={minimize}
					className={buttonClassName}
					style={buttonStyle}
				>
					{icons?.minimize ?? <MinimizeIcon />}
				</button>
			)}

			{controls.includes("maximize") && (
				<button
					type="button"
					onClick={() => (isMaximized ? restore() : maximize())}
					className={buttonClassName}
					style={buttonStyle}
				>
					{isMaximized
						? (icons?.restore ?? <RestoreIcon />)
						: (icons?.maximize ?? <MaximizeIcon />)}
				</button>
			)}

			{controls.includes("close") && (
				<button
					type="button"
					onClick={close}
					className={
						closeButtonClassName
							? `${buttonClassName ?? ""} ${closeButtonClassName}`.trim()
							: buttonClassName
					}
					style={buttonStyle}
				>
					{icons?.close ?? <CloseIcon />}
				</button>
			)}
		</div>
	);
}
