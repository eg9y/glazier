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
- **Snap-to-edges** with visual preview (left/right 50% split)
- **Maximize/minimize/restore** with bounds memory
- **Z-index management** (bring to front, send to back)
- **Double-click to maximize** (optional)
- **Bounds constraint** with automatic out-of-bounds reposition
- **Component registry pattern** for declarative, serializable window state
- **Headless design** - zero styles included, full control over appearance
- **TypeScript** - fully typed API

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

### Component Registry Pattern

For apps with multiple window types, use the registry pattern. Define components once, then open windows by referencing their `componentId`. This makes window state fully serializable (great for localStorage or URL persistence).

```tsx
const registry = {
  settings: SettingsPanel,
  terminal: TerminalApp,
  notes: NotesApp,
};

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

## Components

### WindowManagerProvider

Root provider that manages all window state.

| Prop | Type | Description |
|------|------|-------------|
| `children` | `ReactNode` | Child components |
| `defaultWindows` | `WindowState[]` | Initial windows to render |
| `registry` | `WindowRegistry` | Component registry for Desktop pattern |
| `boundsRef` | `RefObject<HTMLElement>` | Container element for bounds constraints |

### Window

Positioning container for a single window.

| Prop | Type | Description |
|------|------|-------------|
| `id` | `string` | Window ID (must match a window in state) |
| `children` | `ReactNode` | Window content |
| `className` | `string` | Optional CSS class |
| `style` | `CSSProperties` | Optional inline styles |

### Desktop

Auto-renders windows from the registry based on `componentId`.

| Prop | Type | Description |
|------|------|-------------|
| `children` | `(props: DesktopRenderProps) => ReactNode` | Render function |
| `className` | `string` | Optional CSS class |
| `style` | `CSSProperties` | Optional inline styles |

**DesktopRenderProps:**
- `Component` - The resolved React component from registry
- `windowId` - The window's ID
- `componentProps` - Props to pass to the component
- `windowState` - Full window state object

### Taskbar

Headless taskbar component with render props.

| Prop | Type | Description |
|------|------|-------------|
| `children` | `(props: TaskbarRenderProps) => ReactNode` | Render function |

**TaskbarRenderProps:**
- `windows` - Array of all window states
- `activeWindowId` - Currently focused window ID
- `focusWindow(id)` - Focus a window
- `minimizeWindow(id)` - Minimize a window
- `restoreWindow(id)` - Restore a minimized window
- `closeWindow(id)` - Close a window

### SnapPreviewOverlay

Visual preview overlay for snap zones during drag.

| Prop | Type | Description |
|------|------|-------------|
| `zone` | `"left" \| "right" \| null` | Active snap zone |
| `style` | `CSSProperties` | Optional inline styles |

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

```tsx
const {
  id,           // Window ID
  title,        // Window title
  displayState, // "normal" | "minimized" | "maximized"
  isFocused,    // Whether this window is active
  close,        // () => void
  minimize,     // () => void
  maximize,     // () => void
  restore,      // () => void
} = useWindow('window-1');
```

### useWindowDrag(options)

Window-specific drag behavior with snap support.

```tsx
const { isDragging, activeSnapZone, dragHandleProps } = useWindowDrag({
  windowId: 'window-1',
  dragHandleRef: titleBarRef,
  disableMaximizedDragRestore: false, // Allow dragging from maximized
  enableDoubleClickMaximize: true,    // Double-click title bar to maximize
  enableSnapToEdges: true,            // Snap to left/right edges
  onSnapZoneEnter: (zone) => {},      // Called when entering snap zone
  onSnapZoneLeave: () => {},          // Called when leaving snap zone
});

// Spread dragHandleProps onto your title bar element
<div ref={titleBarRef} {...dragHandleProps}>Title</div>
```

### useResize(size, position, options)

Resize handle behavior.

```tsx
const { isResizing, resizeHandleProps } = useResize(
  { width: 400, height: 300 },  // Current size
  { x: 100, y: 100 },           // Current position
  {
    minWidth: 200,
    minHeight: 150,
    maxWidth: 800,
    maxHeight: 600,
    onResizeStart: () => {},
    onResize: (size, position) => updateWindow(id, { size, position }),
    onResizeEnd: (size, position) => {},
  }
);

// Create resize handles for any direction
<div {...resizeHandleProps('se')} /> // Southeast corner
<div {...resizeHandleProps('e')} />  // East edge
<div {...resizeHandleProps('n')} />  // North edge
```

**Resize directions:** `"n"`, `"s"`, `"e"`, `"w"`, `"ne"`, `"nw"`, `"se"`, `"sw"`

### useDrag(options)

Generic drag primitive (used internally by useWindowDrag).

```tsx
const { isDragging, dragHandleProps } = useDrag({
  onDragStart: () => {},
  onDrag: (position, delta) => {},
  onDragEnd: () => {},
  getBoundsConstraint: () => ({ container, windowSize, windowPosition }),
  onConstrainToBounds: (correctedPosition) => {},
});
```

## Types

```tsx
interface WindowState {
  id: string;
  title: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
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
```

## Examples

### Basic Window with Title Bar

```tsx
function BasicWindow({ windowId }: { windowId: string }) {
  const { state, closeWindow } = useWindowManager();
  const win = state.windows.find((w) => w.id === windowId);
  const titleBarRef = useRef<HTMLDivElement>(null);

  const { dragHandleProps } = useWindowDrag({
    windowId,
    dragHandleRef: titleBarRef,
  });

  if (!win) return null;

  return (
    <Window id={windowId} style={{ background: 'white', border: '1px solid #ccc' }}>
      <div ref={titleBarRef} {...dragHandleProps} style={{ padding: 8, background: '#333', color: 'white' }}>
        {win.title}
        <button onClick={() => closeWindow(windowId)}>×</button>
      </div>
      <div style={{ padding: 16 }}>Content</div>
    </Window>
  );
}
```

### Taskbar Implementation

```tsx
function MyTaskbar() {
  return (
    <Taskbar>
      {({ windows, activeWindowId, focusWindow, minimizeWindow, restoreWindow }) => (
        <div style={{ display: 'flex', gap: 4, padding: 8, background: '#222' }}>
          {windows.map((w) => (
            <button
              key={w.id}
              onClick={() => {
                if (w.displayState === 'minimized') restoreWindow(w.id);
                else if (w.id === activeWindowId) minimizeWindow(w.id);
                else focusWindow(w.id);
              }}
              style={{ opacity: w.displayState === 'minimized' ? 0.6 : 1 }}
            >
              {w.title}
            </button>
          ))}
        </div>
      )}
    </Taskbar>
  );
}
```

### Snap Preview with Visual Feedback

```tsx
function DesktopWithSnap() {
  const [snapZone, setSnapZone] = useState<SnapZone | null>(null);

  return (
    <>
      <MyWindow
        onSnapZoneEnter={setSnapZone}
        onSnapZoneLeave={() => setSnapZone(null)}
      />
      <SnapPreviewOverlay zone={snapZone} />
    </>
  );
}
```

## Requirements

- React >= 17
- React DOM >= 17

## License

MIT

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development setup and guidelines.
