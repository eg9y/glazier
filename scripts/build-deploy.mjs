#!/usr/bin/env node

/**
 * Build script for Vercel deployment
 * Copies Storybook and Next.js example builds into the docs dist folder
 */

import { cpSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const docsDir = join(root, "apps/docs/dist");
const storybookDir = join(root, "apps/storybook/storybook-static");
const nextExampleDir = join(root, "apps/examples/next/out");

console.log("📦 Building deployment assets...");

// Ensure docs dist exists
if (!existsSync(docsDir)) {
	console.error("❌ Docs dist not found. Run build first.");
	process.exit(1);
}

// Copy Storybook if it exists
if (existsSync(storybookDir)) {
	const storybookDest = join(docsDir, "storybook");
	console.log(`📚 Copying Storybook to ${storybookDest}`);
	mkdirSync(storybookDest, { recursive: true });
	cpSync(storybookDir, storybookDest, { recursive: true });
	console.log("✅ Storybook copied");
} else {
	console.log("⚠️  Storybook build not found, skipping");
}

// Copy Next.js example if it exists
if (existsSync(nextExampleDir)) {
	const nextDest = join(docsDir, "examples/next");
	console.log(`⚡ Copying Next.js example to ${nextDest}`);
	mkdirSync(nextDest, { recursive: true });
	cpSync(nextExampleDir, nextDest, { recursive: true });
	console.log("✅ Next.js example copied");
} else {
	console.log("⚠️  Next.js example build not found, skipping");
}

console.log("🎉 Deployment assets ready!");
