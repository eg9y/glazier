# Glazier

[![npm version](https://img.shields.io/npm/v/glazier.svg)](https://www.npmjs.com/package/glazier)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/glazier)](https://bundlephobia.com/package/glazier)
[![license](https://img.shields.io/npm/l/glazier.svg)](https://github.com/eg9y/glazier/blob/main/LICENSE)


> Headless React window management primitives

<!-- TODO: Add demo GIF -->
<!-- ![Glazier Demo](./demo.gif) -->

Glazier provides unstyled, fully accessible window management components for React. Build desktop-like interfaces with draggable, resizable windows-bring your own UI.

## Features

- **Draggable windows** with pointer capture for reliable tracking
- **Resizable** from 8 directions (n, s, e, w, ne, nw, se, sw)
- **Snap-to-edges** with visual preview (left/right/top split)
- **Maximize/minimize/restore** with bounds memory
- **Z-index management** (bring to front, send to back)
- **Double-click to maximize** (optional)
- **Bounds constraint** with automatic out-of-bounds reposition
- **Desktop icons** with grid snapping and drag support
- **Icon selection** with multi-select capability
- **Icon-to-window launching** - double-click icons to open/focus windows
- **Window animations** - open/close animations from icon position, drag shrink effects
- **Component registry pattern** for declarative, serializable window state
- **Headless design** - zero styles included, full control over appearance
- **TypeScript** - fully typed API

### New in Latest Version

- **`defineWindows`** - Unified configuration helper for windows, icons, and routes
- **`useWindowRouting`** - Automatic bidirectional URL ↔ window sync (browser back/forward support)
- **`WindowFrame` composables** - Pre-built primitives (TitleBar, Title, WindowControls, Content) that reduce boilerplate
- **`ResizeHandles`** - Ready-to-use resize handles component
- **`useIconLauncher`** - Hook for "open or focus" desktop icon pattern
- **`createRegistry`** - Type-safe component registry helper
- **`createBrowserAdapter`** - Framework-agnostic URL routing adapter
- **Animation support** - `closingWindowIds` and `finalizeClose` for smooth open/close animations
- **Top snap zone** - Windows can now snap to top edge for maximize

## Installation

```bash
npm install glazier
```

```bash
pnpm add glazier
```

```bash
yarn add glazier
```

## Quick Start

### Option 1: Using WindowFrame Composables (Recommended)

The new `WindowFrame` system dramatically reduces boilerplate:

```tsx
import { useRef } from 'react';
import {
  WindowManagerProvider,
  Window,
  Desktop,
  WindowFrame,
  TitleBar,
  Title,
  WindowControls,
  Content,
  ResizeHandles,
  createRegistry,
} from 'glazier';
import { defineWindows } from 'glazier/server';

// Define all windows in one place
const windows = defineWindows({
  home: {
    title: 'Home',
    defaultPosition: { x: 100, y: 100 },
    defaultSize: { width: 400, height: 300 },
    path: '/',
    icon: { label: 'Home', iconKey: 'home', position: { x: 20, y: 20 } },
  },
  settings: {
    title: 'Settings',
    defaultPosition: { x: 150, y: 150 },
    defaultSize: { width: 350, height: 400 },
    path: '/settings',
  },
});

// Type-safe registry
const registry = createRegistry(windows.ids, {
  home: HomeWindow,
  settings: SettingsWindow,
});

function App() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <WindowManagerProvider
      boundsRef={containerRef}
      registry={registry}
      defaultWindows={[windows.getWindowState('home')]}
      defaultIcons={windows.getIconConfigs()}
    >
      <div ref={containerRef} style={{ position: 'relative', height: '100vh' }}>
        <Desktop>
          {({ windowId, component: Component }) => (
            <Window id={windowId}>
              <Component windowId={windowId} />
            </Window>
          )}
        </Desktop>
      </div>
    </WindowManagerProvider>
  );
}

// Window with minimal boilerplate using WindowFrame
function HomeWindow({ windowId }: { windowId: string }) {
  return (
    <WindowFrame windowId={windowId} enableDoubleClickMaximize enableSnapToEdges>
      <TitleBar className="bg-slate-900 h-10 px-3">
        <Title className="text-white" />
        <WindowControls />
      </TitleBar>
      <Content className="p-4">
        <h1>Welcome!</h1>
      </Content>
      <ResizeHandles windowId={windowId} minWidth={300} minHeight={200} />
    </WindowFrame>
  );
}
```

### Option 2: Manual Control (Full Flexibility)

For complete control over every aspect:

```tsx
import { useRef } from 'react';
import {
  WindowManagerProvider,
  Window,
  useWindowManager,
  useWindowDrag,
  useResize,
} from 'glazier';

function App() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <WindowManagerProvider
      boundsRef={containerRef}
      defaultWindows={[
        {
          id: 'window-1',
          title: 'My Window',
          position: { x: 100, y: 100 },
          size: { width: 400, height: 300 },
          zIndex: 1,
          displayState: 'normal',
        },
      ]}
    >
      <div ref={containerRef} style={{ position: 'relative', height: '100vh' }}>
        <MyWindow windowId="window-1" />
      </div>
    </WindowManagerProvider>
  );
}

function MyWindow({ windowId }: { windowId: string }) {
  const { state, updateWindow, closeWindow } = useWindowManager();
  const win = state.windows.find((w) => w.id === windowId);
  const titleBarRef = useRef<HTMLDivElement>(null);

  const { isDragging, dragHandleProps } = useWindowDrag({
    windowId,
    dragHandleRef: titleBarRef,
    enableDoubleClickMaximize: true,
  });

  const { resizeHandleProps } = useResize(
    win?.size ?? { width: 400, height: 300 },
    win?.position ?? { x: 0, y: 0 },
    {
      minWidth: 200,
      minHeight: 150,
      onResize: (size, position) => updateWindow(windowId, { size, position }),
    }
  );

  if (!win) return null;

  return (
    <Window id={windowId}>
      <div ref={titleBarRef} {...dragHandleProps}>
        {win.title}
        <button onClick={() => closeWindow(windowId)}>×</button>
      </div>
      <div>Window content here</div>
      <div {...resizeHandleProps('se')} />
    </Window>
  );
}
```

## Core Concepts

### Headless Design

Glazier provides behavior, not appearance. Components handle positioning, state management, and user interactions-you provide all styling. This gives you complete control over the look and feel.

### defineWindows - Unified Configuration

Instead of maintaining separate configs for windows, icons, and routes:

```tsx
import { defineWindows } from 'glazier/server';

const windows = defineWindows({
  home: {
    title: 'Home',
    defaultPosition: { x: 100, y: 100 },
    defaultSize: { width: 400, height: 300 },
    path: '/',
    icon: {
      label: 'Home',
      iconKey: 'home',
      position: { x: 20, y: 20 },
    },
  },
  about: {
    title: 'About',
    defaultPosition: { x: 150, y: 150 },
    defaultSize: { width: 480, height: 380 },
    path: '/about',
    icon: {
      label: 'About',
      iconKey: 'about',
      position: { x: 20, y: 120 },
    },
  },
});

// Use the helpers
windows.getWindowState('home');     // WindowState for opening
windows.getIconConfigs();           // All icon configs
windows.getPathMap();               // { home: '/', about: '/about' }
windows.getValidSlugs();            // ['about'] (excludes '/')
windows.has('home');                // true
windows.ids;                        // ['home', 'about']
```

### WindowFrame Composables

Reduce window chrome boilerplate from ~70 lines to ~15:

```tsx
import {
  WindowFrame,
  TitleBar,
  Title,
  WindowControls,
  Content,
  ResizeHandles,
} from 'glazier';

function MyWindow({ windowId }: { windowId: string }) {
  return (
    <WindowFrame
      windowId={windowId}
      enableDoubleClickMaximize
      enableSnapToEdges
      onSnapZoneChange={(zone) => console.log('Snap zone:', zone)}
    >
      <TitleBar className="h-10 bg-slate-900">
        <Title />
        <WindowControls
          buttonClassName="hover:bg-slate-700"
          closeButtonClassName="hover:bg-red-600"
        />
      </TitleBar>
      <Content className="overflow-auto p-4">
        Your content here
      </Content>
      <ResizeHandles windowId={windowId} minWidth={300} minHeight={200} />
    </WindowFrame>
  );
}
```

### Component Registry Pattern

For apps with multiple window types, use the registry pattern with type safety:

```tsx
import { createRegistry } from 'glazier';
import { defineWindows } from 'glazier/server';

const windows = defineWindows({
  settings: { title: 'Settings', ... },
  terminal: { title: 'Terminal', ... },
  notes: { title: 'Notes', ... },
});

// Type-safe: TypeScript ensures all window IDs have components
const registry = createRegistry(windows.ids, {
  settings: SettingsPanel,
  terminal: TerminalApp,
  notes: NotesApp,
});

<WindowManagerProvider registry={registry}>
  <Desktop>
    {({ Component, windowId, componentProps }) => (
      <Window id={windowId}>
        <Component windowId={windowId} {...componentProps} />
      </Window>
    )}
  </Desktop>
</WindowManagerProvider>
```

### Desktop Icons with useIconLauncher

Simplify icon "open or focus" logic:

```tsx
import { useIconLauncher, DesktopIconGrid } from 'glazier';

function DesktopIcon({ iconId, iconState, ...props }) {
  const { launchProps, isWindowOpen } = useIconLauncher({ iconId });

  return (
    <div {...props.dragProps} {...launchProps}>
      <IconImage active={isWindowOpen} />
      <span>{iconState.label}</span>
    </div>
  );
}
```

### URL Routing

Sync window focus with browser URL using `useWindowRouting`. This hook provides automatic **bidirectional** synchronization:

- Window focus → URL updates
- Browser back/forward → Window focus/open

```tsx
import { useWindowRouting, createBrowserAdapter } from 'glazier';
import { defineWindows } from 'glazier/server';

const windows = defineWindows({
  home: { title: 'Home', path: '/', ... },
  about: { title: 'About', path: '/about', ... },
});

const routingAdapter = createBrowserAdapter({ basePath: '/app' });

function DesktopWithRouting() {
  // Bidirectional sync happens automatically
  useWindowRouting({
    windows,
    adapter: routingAdapter,
  });

  return (
    <WindowManagerProvider
      defaultWindows={[windows.getWindowState('home')]}
    >
      <Desktop>{/* ... */}</Desktop>
    </WindowManagerProvider>
  );
}
```

### Window Animations

Glazier provides animation hooks for smooth window open/close effects. The `closingWindowIds` Set and `finalizeClose` function enable delayed window removal for exit animations:

```tsx
import { useWindowManager, toCSSValue } from 'glazier';

function AnimatedWindow({ id, children }) {
  const { state, closingWindowIds, finalizeClose } = useWindowManager();
  const windowState = state.windows.find((w) => w.id === id);
  const isClosing = closingWindowIds.has(id);

  // Trigger animation removal after close animation
  useEffect(() => {
    if (isClosing) {
      const timer = setTimeout(() => finalizeClose(id), 250);
      return () => clearTimeout(timer);
    }
  }, [isClosing, id, finalizeClose]);

  // Use windowState.animationSource for icon position (set by launchIcon)
  const { animationSource, position } = windowState;

  return (
    <div
      style={{
        animation: isClosing
          ? 'windowClose 250ms ease-out forwards'
          : 'windowOpen 250ms ease-out forwards',
        '--source-x': `${animationSource?.x ?? 0}px`,
        '--source-y': `${animationSource?.y ?? 0}px`,
        '--target-x': `${position.x}px`,
        '--target-y': `${position.y}px`,
      }}
    >
      {children}
    </div>
  );
}
```

For drag shrink effects, use `onDragStart` and `onDragEnd` callbacks on `WindowFrame`:

```tsx
function WindowWithDragShrink({ windowId, children }) {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div style={{ transform: isDragging ? 'scale(0.98)' : 'scale(1)' }}>
      <WindowFrame
        windowId={windowId}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => setIsDragging(false)}
      >
        {children}
      </WindowFrame>
    </div>
  );
}
```

## Components

### WindowManagerProvider

Root provider that manages all window state.

| Prop | Type | Description |
|------|------|-------------|
| `children` | `ReactNode` | Child components |
| `defaultWindows` | `WindowState[]` | Initial windows to render |
| `defaultIcons` | `IconState[]` | Initial desktop icons |
| `registry` | `WindowRegistry` | Component registry for Desktop pattern |
| `defaultWindowConfigs` | `WindowConfigRegistry` | Default window configs by componentId |
| `boundsRef` | `RefObject<HTMLElement>` | Container element for bounds constraints |
| `initialFocusedWindowId` | `string` | Which window to focus initially |
| `onFocusChange` | `(windowId: string \| null) => void` | Callback when focus changes |

### Window

Positioning container for a single window.

| Prop | Type | Description |
|------|------|-------------|
| `id` | `string` | Window ID (must match a window in state) |
| `children` | `ReactNode` | Window content |
| `className` | `string` | Optional CSS class |
| `style` | `CSSProperties` | Optional inline styles |

### WindowFrame

Container for window chrome with built-in drag context.

| Prop | Type | Description |
|------|------|-------------|
| `windowId` | `string` | Window ID |
| `children` | `ReactNode` | TitleBar, Content, ResizeHandles |
| `enableDoubleClickMaximize` | `boolean` | Double-click title bar to maximize |
| `enableSnapToEdges` | `boolean` | Enable edge snapping |
| `onSnapZoneChange` | `(zone: 'left' \| 'right' \| null) => void` | Snap zone callback |

### TitleBar, Title, WindowControls, Content

Composable primitives for window chrome. Use within `WindowFrame`.

```tsx
<WindowFrame windowId={id}>
  <TitleBar className="...">
    <Title />
    <WindowControls controls={['minimize', 'maximize', 'close']} />
  </TitleBar>
  <Content>{children}</Content>
</WindowFrame>
```

### ResizeHandles

Pre-built resize handles component.

| Prop | Type | Description |
|------|------|-------------|
| `windowId` | `string` | Window ID |
| `minWidth` | `number` | Minimum width (default: 100) |
| `minHeight` | `number` | Minimum height (default: 50) |
| `maxWidth` | `number` | Maximum width |
| `maxHeight` | `number` | Maximum height |
| `hideWhenMaximized` | `boolean` | Hide when maximized (default: true) |

### Desktop

Auto-renders windows from the registry based on `componentId`.

### Taskbar

Headless taskbar component with render props.

### SnapPreviewOverlay

Visual preview overlay for snap zones during drag.

### DesktopIconGrid

Container that renders all icons with grid awareness.

## Hooks

### useWindowManager()

Access the window manager context.

```tsx
const {
  state,              // { windows: WindowState[], activeWindowId: string | null }
  openWindow,         // (config: WindowConfig) => void
  closeWindow,        // (id: string) => void
  focusWindow,        // (id: string) => void
  updateWindow,       // (id: string, updates: Partial<WindowState>) => void
  bringToFront,       // (id: string) => void
  sendToBack,         // (id: string) => void
  minimizeWindow,     // (id: string) => void
  maximizeWindow,     // (id: string) => void
  restoreWindow,      // (id: string) => void
  getContainerBounds, // () => { width: number, height: number } | null
} = useWindowManager();
```

### useWindow(windowId)

Convenience hook for a single window.

### useWindowFrame()

Access WindowFrame context (for custom window chrome).

```tsx
const {
  title,
  displayState,
  isFocused,
  close,
  minimize,
  maximize,
  restore,
  dragHandleRef,
  dragHandleProps,
  activeSnapZone,
} = useWindowFrame();
```

### useIconLauncher(options)

Handles "open or focus existing window" pattern for icons.

```tsx
const { launch, launchProps, isWindowOpen, existingWindow } = useIconLauncher({
  iconId: 'icon-1',
});
```

### useWindowDrag(options)

Window-specific drag behavior with snap support.

### useResize(size, position, options)

Resize handle behavior.

### useDesktopIcon(iconId)

Access and control a single desktop icon.

### useIconDrag(options)

Drag behavior for desktop icons with optional grid snapping.

## Types

```tsx
interface WindowState {
  id: string;
  title: string;
  position: { x: number; y: number };
  size: { width: number | string; height: number | string };
  zIndex: number;
  displayState: 'normal' | 'minimized' | 'maximized';
  previousBounds?: { position: Position; size: Size };
  componentId?: string;
  componentProps?: Record<string, unknown>;
}

type WindowConfig = Omit<WindowState, 'zIndex' | 'displayState' | 'previousBounds'> & {
  zIndex?: number;
  displayState?: WindowDisplayState;
};

type WindowRegistry = Record<string, ComponentType<{ windowId: string }>>;

type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

type SnapZone = 'left' | 'right';

interface IconState {
  id: string;
  label: string;
  componentId: string;
  componentProps?: Record<string, unknown>;
  position: Position;
  icon?: string;
}

interface GridConfig {
  cellWidth: number;
  cellHeight: number;
  gap?: number;
}

// defineWindows configuration
interface WindowDefinition {
  title: string;
  defaultPosition: Position;
  defaultSize: Size;
  path?: string;
  icon?: {
    label?: string;
    iconKey?: string;
    position: Position;
  };
  defaultProps?: Record<string, unknown>;
}
```

## Examples

See [`apps/examples/next`](./apps/examples/next) and [`apps/examples/astro`](./apps/examples/astro) for complete implementations demonstrating:

- `defineWindows` unified configuration
- `WindowFrame` composables
- `useIconLauncher` for desktop icons
- `createBrowserAdapter` for URL routing
- Type-safe registries with `createRegistry`

## Requirements

- React >= 17
- React DOM >= 17

## License

MIT

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development setup and guidelines.
