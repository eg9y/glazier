import type { CSSProperties, JSX, ReactNode } from "react";
import { useWindowFrame } from "./WindowFrameContext";

export type WindowControlType = "minimize" | "maximize" | "close";

export interface WindowControlsProps {
	className?: string;
	style?: CSSProperties;
	controls?: WindowControlType[];
	icons?: {
		minimize?: ReactNode;
		maximize?: ReactNode;
		restore?: ReactNode;
		close?: ReactNode;
	};
	buttonClassName?: string;
	buttonStyle?: CSSProperties;
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
