# Contributing to Glazier

Thank you for your interest in contributing to Glazier! This document provides guidelines and information for contributors.

## Development Setup

```bash
# Clone the repository
git clone https://github.com/your-username/glazier.git
cd glazier

# Install dependencies
pnpm install

# Start development server (builds, runs Storybook, and tests in watch mode)
pnpm dev
```

> **Note:** This project uses [pnpm](https://pnpm.io/) for package management. If you prefer another package manager, remove `pnpm-lock.yaml` and replace `pnpm` commands accordingly.

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Watch mode with Storybook and tests |
| `pnpm build` | Production build with tsup |
| `pnpm test` | Run tests in watch mode |
| `pnpm test:ci` | Run tests once with coverage |
| `pnpm lint` | Lint and format with Biome |
| `pnpm storybook` | Start Storybook dev server |
| `pnpm storybook:build` | Build static Storybook |
| `pnpm commit` | Create a formatted commit message |
| `pnpm release` | Build and create a release |

## Project Structure

```
src/
├── components/          # React components
│   ├── WindowManagerProvider.tsx
│   ├── Window.tsx
│   ├── Desktop.tsx
│   ├── Taskbar.tsx
│   └── SnapPreviewOverlay.tsx
├── hooks/               # React hooks
│   ├── useWindowManager.ts
│   ├── useWindow.ts
│   ├── useDrag.ts
│   ├── useWindowDrag.ts
│   └── useResize.ts
├── context/             # React context
│   └── WindowManagerContext.ts
├── utils/               # Utility functions
│   ├── id.ts
│   └── validateWindowState.ts
├── types.ts             # TypeScript type definitions
├── index.ts             # Public API exports
└── stories/             # Storybook stories
    └── WindowManager.stories.tsx
```

## Development Workflow

### Storybook

Storybook is the primary development environment. Use it to build and test UI components in isolation:

```bash
pnpm storybook
```

Visit `http://localhost:6006` to view the component library.

### Testing

Tests are written with [Vitest](https://vitest.dev/) and [Testing Library](https://testing-library.com/):

```bash
# Watch mode (runs automatically with pnpm dev)
pnpm test

# Run once with coverage
pnpm test:ci
```

### Linting

This project uses [Biome](https://biomejs.dev/) for linting and formatting:

```bash
pnpm lint
```

For the best experience, install the [Biome VS Code extension](https://marketplace.visualstudio.com/items?itemName=biomejs.biome).

## Building

The package is bundled with [tsup](https://github.com/egoist/tsup), outputting both ESM and CommonJS formats:

```bash
pnpm build
```

Output structure:
- `dist/index.mjs` - ESM module
- `dist/index.js` - CommonJS module
- `dist/index.d.ts` - TypeScript declarations

## Committing Changes

This project uses [Commitizen](https://github.com/commitizen/cz-cli) for standardized commit messages:

```bash
pnpm commit
```

Pre-commit hooks (via [Lefthook](https://github.com/evilmartians/lefthook)) will automatically lint staged files.

## Releasing

Releases are managed with [release-it](https://github.com/release-it/release-it):

```bash
pnpm release
```

This will:
1. Build the package
2. Create a semantic version tag
3. Generate a GitHub Release

### GitHub Actions

- **Tests** run on every push
- **NPM publish** triggers automatically on new GitHub Releases
- **Storybook** deploys to GitHub Pages on release

#### Setup Requirements

For automated publishing:
1. Add your NPM token as a GitHub Action secret (`NPM_TOKEN`)
2. Enable "Read & write permissions" for Workflows in repository settings
3. Set GitHub Pages source to "GitHub Actions"

## Running TypeScript Files

Execute TypeScript files directly with tsx:

```bash
pnpm tsx ./path/to/file.ts
```

## Linking for Local Development

To test the package in another local project:

```bash
# In glazier directory
pnpm link:self

# In your test project
pnpm link glazier --global
```

## CSS Bundling

If adding CSS to the package:

1. Add CSS files to `src/` (e.g., `src/styles.css`)
2. Update `tsup.config.ts`:
   ```ts
   export default defineConfig({
     entry: ["src/index.ts", "src/styles.css"],
     // ...
   });
   ```
3. Update `package.json` exports:
   ```json
   {
     "exports": {
       "./styles.css": "./dist/styles.css"
     }
   }
   ```
4. Consumers can import: `import "glazier/styles.css"`

For PostCSS support, add `postcss` and configure `postcss.config.js`.

## Code Style Guidelines

- Use TypeScript for all source files
- Follow existing patterns in the codebase
- Keep components headless (no built-in styles)
- Export all public types from `src/types.ts`
- Add Storybook stories for new components
- Write tests for new functionality
