import { describe, expect, it } from "vitest";
import { validateWindowState } from "../../src";
import type { WindowRegistry, WindowState } from "../../src";

// Simple mock components
const SettingsPanel = () => null;
const TerminalApp = () => null;

const registry: WindowRegistry = {
	settings: SettingsPanel,
	terminal: TerminalApp,
};

describe("validateWindowState", () => {
	it("returns all windows as valid when componentIds exist in registry", () => {
		const windows: WindowState[] = [
			{
				id: "win-1",
				title: "Settings",
				componentId: "settings",
				position: { x: 0, y: 0 },
				size: { width: 300, height: 200 },
				zIndex: 1,
				displayState: "normal",
			},
			{
				id: "win-2",
				title: "Terminal",
				componentId: "terminal",
				position: { x: 100, y: 100 },
				size: { width: 400, height: 300 },
				zIndex: 2,
				displayState: "normal",
			},
		];

		const result = validateWindowState(windows, registry);

		expect(result.valid).toHaveLength(2);
		expect(result.invalid).toHaveLength(0);
	});

	it("filters out windows with invalid componentIds", () => {
		const windows: WindowState[] = [
			{
				id: "win-1",
				title: "Settings",
				componentId: "settings",
				position: { x: 0, y: 0 },
				size: { width: 300, height: 200 },
				zIndex: 1,
				displayState: "normal",
			},
			{
				id: "win-2",
				title: "Unknown",
				componentId: "browser", // Not in registry
				position: { x: 100, y: 100 },
				size: { width: 400, height: 300 },
				zIndex: 2,
				displayState: "normal",
			},
		];

		const result = validateWindowState(windows, registry);

		expect(result.valid).toHaveLength(1);
		expect(result.valid[0].id).toBe("win-1");
		expect(result.invalid).toHaveLength(1);
		expect(result.invalid[0].window.id).toBe("win-2");
		expect(result.invalid[0].reason).toContain("browser");
		expect(result.invalid[0].reason).toContain("not found in registry");
	});

	it("passes through non-registry windows as valid", () => {
		const windows: WindowState[] = [
			{
				id: "legacy-win",
				title: "Legacy",
				position: { x: 0, y: 0 },
				size: { width: 300, height: 200 },
				zIndex: 1,
				displayState: "normal",
			},
		];

		const result = validateWindowState(windows, registry);

		expect(result.valid).toHaveLength(1);
		expect(result.valid[0].id).toBe("legacy-win");
		expect(result.invalid).toHaveLength(0);
	});

	it("handles mixed registry and non-registry windows", () => {
		const windows: WindowState[] = [
			{
				id: "registry-valid",
				title: "Settings",
				componentId: "settings",
				position: { x: 0, y: 0 },
				size: { width: 300, height: 200 },
				zIndex: 1,
				displayState: "normal",
			},
			{
				id: "registry-invalid",
				title: "Invalid",
				componentId: "nonexistent",
				position: { x: 50, y: 50 },
				size: { width: 300, height: 200 },
				zIndex: 2,
				displayState: "normal",
			},
			{
				id: "legacy",
				title: "Legacy Window",
				position: { x: 100, y: 100 },
				size: { width: 300, height: 200 },
				zIndex: 3,
				displayState: "normal",
			},
		];

		const result = validateWindowState(windows, registry);

		expect(result.valid).toHaveLength(2);
		expect(result.valid.map((w) => w.id)).toEqual(["registry-valid", "legacy"]);
		expect(result.invalid).toHaveLength(1);
		expect(result.invalid[0].window.id).toBe("registry-invalid");
	});

	it("returns empty arrays for empty input", () => {
		const result = validateWindowState([], registry);

		expect(result.valid).toHaveLength(0);
		expect(result.invalid).toHaveLength(0);
	});

	it("includes available registry keys in error reason", () => {
		const windows: WindowState[] = [
			{
				id: "win-1",
				title: "Unknown",
				componentId: "unknown",
				position: { x: 0, y: 0 },
				size: { width: 300, height: 200 },
				zIndex: 1,
				displayState: "normal",
			},
		];

		const result = validateWindowState(windows, registry);

		expect(result.invalid[0].reason).toContain("settings");
		expect(result.invalid[0].reason).toContain("terminal");
	});

	it("handles empty registry", () => {
		const emptyRegistry: WindowRegistry = {};
		const windows: WindowState[] = [
			{
				id: "win-1",
				title: "Settings",
				componentId: "settings",
				position: { x: 0, y: 0 },
				size: { width: 300, height: 200 },
				zIndex: 1,
				displayState: "normal",
			},
		];

		const result = validateWindowState(windows, emptyRegistry);

		expect(result.valid).toHaveLength(0);
		expect(result.invalid).toHaveLength(1);
		expect(result.invalid[0].reason).toContain("(empty registry)");
	});

	it("preserves componentProps in valid windows", () => {
		const windows: WindowState[] = [
			{
				id: "win-1",
				title: "Terminal",
				componentId: "terminal",
				componentProps: { cwd: "/home/user", theme: "dark" },
				position: { x: 0, y: 0 },
				size: { width: 400, height: 300 },
				zIndex: 1,
				displayState: "normal",
			},
		];

		const result = validateWindowState(windows, registry);

		expect(result.valid).toHaveLength(1);
		expect(result.valid[0].componentProps).toEqual({
			cwd: "/home/user",
			theme: "dark",
		});
	});
});
