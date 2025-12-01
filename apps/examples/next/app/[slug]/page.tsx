import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DesktopShell } from "../../components/DesktopShell";
import { validSlugs } from "../../lib/windowConfigs";

interface PageProps {
	params: Promise<{ slug: string }>;
}

/**
 * SEO metadata for each page.
 * Define metadata directly in the route file - this is the Next.js native pattern.
 */
const seoMetadata: Record<string, { title: string; description: string }> = {
	about: {
		title: "About | Glazier Next.js Example",
		description:
			"Learn about Glazier, a headless window management library for React. Build desktop-like UIs with draggable, resizable windows.",
	},
	contact: {
		title: "Contact | Glazier Next.js Example",
		description:
			"Get in touch with the Glazier team. We'd love to hear from you about your window management needs.",
	},
};

/**
 * Generate metadata for each page.
 */
export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const { slug } = await params;
	const seo = seoMetadata[slug] || {
		title: "Glazier Next.js Example",
		description: "Glazier is a headless window management library for React.",
	};

	return {
		title: seo.title,
		description: seo.description,
		openGraph: {
			title: seo.title,
			description: seo.description,
		},
		twitter: {
			title: seo.title,
			description: seo.description,
		},
	};
}

/**
 * Dynamic route page - renders the desktop with the specified window focused.
 */
export default async function SlugPage({ params }: PageProps) {
	const { slug } = await params;

	if (!validSlugs.includes(slug) || slug === "home") {
		redirect("/");
	}

	return <DesktopShell initialWindowId={slug} />;
}

/**
 * Generate static params for SEO.
 */
export function generateStaticParams() {
	return validSlugs
		.filter((slug) => slug !== "home")
		.map((slug) => ({ slug }));
}
