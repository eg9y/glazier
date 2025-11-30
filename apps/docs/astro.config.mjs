import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";

export default defineConfig({
	integrations: [
		starlight({
			title: "Glazier",
			description: "Headless React window management primitives",
			social: {
				github: "https://github.com/eg9y/glazier",
			},
			sidebar: [
				{
					label: "Getting Started",
					items: [
						{ label: "Introduction", slug: "getting-started/introduction" },
						{ label: "Installation", slug: "getting-started/installation" },
						{ label: "Quick Start", slug: "getting-started/quick-start" },
					],
				},
				{
					label: "Guides",
					items: [
						{ label: "Window Management", slug: "guides/window-management" },
						{ label: "Desktop Icons", slug: "guides/desktop-icons" },
						{ label: "Component Registry", slug: "guides/component-registry" },
					],
				},
				{
					label: "Examples",
					items: [
						{
							label: "Next.js Example",
							link: "/examples/next/",
							attrs: { target: "_blank" },
						},
						{
							label: "Storybook",
							link: "/storybook/",
							attrs: { target: "_blank" },
						},
					],
				},
				{
					label: "API Reference",
					autogenerate: { directory: "api" },
				},
			],
			customCss: ["./src/styles/custom.css"],
		}),
	],
});
