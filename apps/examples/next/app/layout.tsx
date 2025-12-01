import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: {
		default: "Glazier Next.js Example",
		template: "%s | Glazier Next.js Example",
	},
	description:
		"Glazier is a headless window management library for React. Build desktop-like UIs with draggable, resizable windows, taskbars, and desktop icons.",
	openGraph: {
		type: "website",
		title: "Glazier Next.js Example",
		description:
			"Glazier is a headless window management library for React. Build desktop-like UIs with draggable, resizable windows, taskbars, and desktop icons.",
	},
	twitter: {
		card: "summary",
		title: "Glazier Next.js Example",
		description:
			"Glazier is a headless window management library for React. Build desktop-like UIs with draggable, resizable windows, taskbars, and desktop icons.",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				{children}
			</body>
		</html>
	);
}
