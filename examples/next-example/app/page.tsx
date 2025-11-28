import { DesktopShell } from "../components/DesktopShell";

/**
 * Home page - renders the desktop with the "home" window focused.
 * This is the "/" route.
 */
export default function HomePage() {
	return <DesktopShell initialWindowId="home" />;
}
