# Glazier Astro Example

This example demonstrates how to use [Glazier](../../packages/glazier) with [Astro](https://astro.build) to create a desktop-like UI with SEO-friendly routing.

## Features

- Draggable and resizable windows
- Window minimize, maximize, restore, and close
- Snap-to-edges when dragging windows
- Desktop icons to launch windows
- Taskbar for window navigation
- SEO-friendly URL routing (`/`, `/about`, `/contact`)

## Project Structure

```text
/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── DesktopShell.tsx      # Main React component
│   │   └── windows/
│   │       ├── WindowChrome.tsx  # Shared window chrome
│   │       ├── HomeWindow.tsx
│   │       ├── AboutWindow.tsx
│   │       └── ContactWindow.tsx
│   ├── layouts/
│   │   └── Layout.astro
│   ├── lib/
│   │   └── windowConfigs.ts      # Window and icon configs
│   ├── pages/
│   │   ├── index.astro           # Home route (/)
│   │   └── [slug].astro          # Dynamic routes (/about, /contact)
│   └── styles/
│       └── global.css
└── package.json
```

## Getting Started

From the repository root:

```sh
# Install dependencies
pnpm install

# Start development server
pnpm --filter @glazier/example-astro dev
```

The development server will start at `http://localhost:4321`.

## How It Works

### React Integration

Astro uses `@astrojs/react` to enable React components. The `DesktopShell` component is mounted with `client:only="react"` to ensure it only renders on the client (glazier requires browser APIs).

### URL Routing

- `/` - Opens with Home window focused
- `/about` - Opens with About window focused
- `/contact` - Opens with Contact window focused

When you focus a window, the URL updates via `window.history.replaceState()`. On page refresh, only the focused window is open.

### Styling

Uses Tailwind CSS via `@astrojs/tailwind` with the same styling as the Next.js example.
