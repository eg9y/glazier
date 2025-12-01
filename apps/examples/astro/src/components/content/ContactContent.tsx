/**
 * Server-renderable content for the Contact window.
 * This content is visible to search crawlers for SEO.
 *
 * Note: The form is interactive but the static HTML structure
 * is still valuable for SEO - crawlers can see the form fields
 * and understand the page's purpose.
 */
export function ContactContent() {
	return (
		<div className="p-6">
			<h1 className="mb-4 font-bold text-2xl text-white">Contact Us</h1>
			<p className="mb-6 text-slate-300">
				Get in touch with the Glazier team.
			</p>

			<form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
				<div>
					<label
						htmlFor="name"
						className="mb-1 block font-medium text-slate-300 text-sm"
					>
						Name
					</label>
					<input
						type="text"
						id="name"
						className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
						placeholder="Your name"
					/>
				</div>
				<div>
					<label
						htmlFor="email"
						className="mb-1 block font-medium text-slate-300 text-sm"
					>
						Email
					</label>
					<input
						type="email"
						id="email"
						className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
						placeholder="you@example.com"
					/>
				</div>
				<div>
					<label
						htmlFor="message"
						className="mb-1 block font-medium text-slate-300 text-sm"
					>
						Message
					</label>
					<textarea
						id="message"
						rows={3}
						className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
						placeholder="Your message..."
					/>
				</div>
				<button
					type="submit"
					className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-sm text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800"
				>
					Send Message
				</button>
			</form>
		</div>
	);
}
