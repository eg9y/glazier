import { redirect } from "next/navigation";
import { DesktopShell } from "../../components/DesktopShell";
import { validSlugs } from "../../lib/windowConfigs";

interface PageProps {
	params: Promise<{ slug: string }>;
}

/**
 * Dynamic route page - renders the desktop with the specified window focused.
 * Routes like "/about" and "/contact" are handled here.
 */
export default async function SlugPage({ params }: PageProps) {
	const { slug } = await params;

	// Redirect to home if slug is invalid
	if (!validSlugs.includes(slug) || slug === "home") {
		redirect("/");
	}

	return <DesktopShell initialWindowId={slug} />;
}

/**
 * Generate static params for SEO.
 * This pre-renders pages for all valid slugs.
 */
export function generateStaticParams() {
	return validSlugs
		.filter((slug) => slug !== "home") // "home" is handled by the root page
		.map((slug) => ({ slug }));
}
