
# react-desktop-os — Product Requirements Document

## Core Philosophy

- **Headless by default** — Zero styling, consumers bring their own
- **Primitives over opinions** — Building blocks, not finished products
- **Escape hatches everywhere** — Direct access to state and handlers when abstractions fail
- **Unix philosophy** - Do one thing and do it really well. Simplicity and elegance.

---

## Window Management

### Operations
- Open, close, focus, minimize, maximize, restore

### Positioning & Sizing
- Drag to reposition
- Resize from edges/corners with min/max constraints

### Window Snapping
- Left/Right edge drag → 50% split
- Top edge drag → Full maximize
- Visual preview overlay during drag
- Configurable snap threshold (default 50px)

### Z-Index Strategy
- Auto-focus on click brings window to front
- Incrementing z-index counter with periodic rebalancing (when highest z exceeds threshold, normalize all windows)
- Exposed `bringToFront(windowId)` and `sendToBack(windowId)` methods for manual control

### Window State
- `normal` | `minimized` | `maximized`

### Window Relationships
- Modal support planned for v2 (blocking behavior)

---

## Components

### WindowManagerProvider
Root context provider. Wraps entire app. Supports controlled or uncontrolled modes.

### Desktop
Renders windows from context. Handles click-to-focus. Accepts arbitrary children for custom overlays.

### Window
Container with drag/resize handles. Supports two content patterns:

```tsx
// Pattern A: Direct children
<Window id="settings" title="Settings">
  <SettingsPanel />
</Window>

// Pattern B: Render prop for window state access
<Window id="settings" title="Settings">
  {({ isMaximized, close, minimize }) => (
    <SettingsPanel onClose={close} />
  )}
</Window>
```

### Taskbar
Displays all windows. Headless by default with render prop:

```tsx
<Taskbar>
  {({ windows, focusWindow, minimizeWindow }) => (
    <div className="my-taskbar">
      {windows.map(w => (
        <button key={w.id} onClick={() => focusWindow(w.id)}>
          {w.title}
        </button>
      ))}
    </div>
  )}
</Taskbar>
```

### DesktopIcon
Launchable icon with optional grid snapping.

---

## Hooks

### useWindowManager
Full control over all windows:
```tsx
const { 
  windows,          // WindowState[]
  open,             // (config: WindowConfig) => void
  close,            // (id: string) => void
  focus,            // (id: string) => void
  minimize,         // (id: string) => void
  maximize,         // (id: string) => void
  restore,          // (id: string) => void
  bringToFront,     // (id: string) => void
  sendToBack,       // (id: string) => void
  updateWindow,     // (id: string, partial: Partial<WindowState>) => void
} = useWindowManager();
```

### useWindow
Access current window context from within window content:
```tsx
const { 
  id, 
  state,        // 'normal' | 'minimized' | 'maximized'
  isFocused,
  close, 
  minimize, 
  maximize,
  restore,
} = useWindow();
```

### useDrag / useResize
Low-level primitives for building custom window chrome:
```tsx
const { isDragging, dragHandleProps } = useDrag(windowId);
const { isResizing, resizeHandleProps } = useResize(windowId, 'se'); // direction
```

### useWindowTransition
Animation state for integrating with animation libraries:
```tsx
const {
  isDragging,     // true during drag
  isResizing,     // true during resize
  isSnapping,     // true during snap transition
} = useWindowTransition(windowId);
```

---

## State & Persistence

### Component Registry
Components are registered separately from window state, keeping state fully serializable:

```tsx
// Define the registry (maps string keys to components)
const registry = {
  settings: SettingsPanel,
  terminal: TerminalApp,
  browser: WebView,
} satisfies WindowRegistry;

// Provider resolves componentId → component at render time
<WindowManagerProvider registry={registry}>
  {/* ... */}
</WindowManagerProvider>
```

### State Model
Flat, fully serializable state keyed by window ID:
```tsx
interface WindowState {
  id: string;
  title: string;
  componentId: string;           // References registry key, NOT a component
  componentProps?: object;       // Optional serializable props
  position: { x: number; y: number };
  size: { width: number; height: number };
  state: 'normal' | 'minimized' | 'maximized';
  zIndex: number;
  constraints?: {                // Optional size constraints
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
  };
}

// Type-safe registry
type WindowRegistry = Record<string, React.ComponentType<any>>;
```

This enables:
- localStorage/sessionStorage persistence
- Redux/Zustand with time-travel debugging
- URL state serialization
- Server-side state hydration

### Controlled Mode
For external state management (Redux, Zustand, URL sync):
```tsx
<WindowManagerProvider 
  registry={registry}
  windows={windows} 
  onWindowsChange={setWindows}
/>
```

### Uncontrolled Mode
For simple use cases:
```tsx
<WindowManagerProvider 
  registry={registry}
  initialWindows={defaultWindows} 
/>
```

### Serialization
State is plain JSON — no special helpers needed:
```tsx
// Save
localStorage.setItem('windows', JSON.stringify(windows));

// Restore
const restored = JSON.parse(localStorage.getItem('windows') ?? '[]');
```

Optional validation helper for type safety:
```tsx
import { validateWindowState } from 'react-desktop-os';

const restored = validateWindowState(JSON.parse(raw), registry);
// Filters out windows with invalid componentIds
```

---

## Router Integration Hooks

While routing is not built-in, the library provides hooks for integration:

```tsx
// Window IDs can double as route segments
const { open } = useWindowManager();

open({
  id: 'settings',  // Use as route: /app/settings
  component: SettingsPanel,
  title: 'Settings',
});

// Callbacks for router sync
<WindowManagerProvider
  onWindowOpen={(window) => router.push(`/app/${window.id}`)}
  onWindowClose={(windowId) => router.push('/app')}
  onWindowFocus={(windowId) => router.replace(`/app/${windowId}`)}
/>
```

Framework-specific examples provided in documentation for Next.js, React Router, and TanStack Router.

---

## Accessibility

### Priority 1 (v1.0)
- ARIA roles (`dialog` for windows, `toolbar` for taskbar)
- `aria-label` and `aria-describedby` support
- Respects `prefers-reduced-motion`

### Priority 2 (v1.1)
- Focus trapping within active windows
- Focus restoration on window close
- Screen reader announcements for state changes

---

## Technical Constraints

- React 18+ (uses `useSyncExternalStore`)
- Zero runtime dependencies (peer dep on React only)
- Tree-shakable ESM with TypeScript declarations
- **< 10KB gzipped** bundle target
- SSR compatible (no `window` access during render)

---

## Implementation Notes

### Drag & Drop
Custom implementation using Pointer Events (no external dependencies):

**Why Pointer Events over Mouse Events:**
- Single API for mouse, touch, and pen input
- Built-in pointer capture (`setPointerCapture`) prevents event loss during fast drags
- Better performance than touch event polyfills

**Essential: GPU-accelerated positioning:**
```tsx
// DO: Use transform for GPU compositing (60fps)
style={{ transform: `translate3d(${x}px, ${y}px, 0)` }}

// DON'T: Use top/left (triggers layout recalc, janky)
style={{ top: y, left: x }}
```

**`useDrag` hook sketch:**
```tsx
function useDrag(windowId: string) {
  const [isDragging, setIsDragging] = useState(false);
  const { updateWindow } = useWindowManager();
  const startPos = useRef({ x: 0, y: 0 });
  const startWindowPos = useRef({ x: 0, y: 0 });

  const onPointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    startPos.current = { x: e.clientX, y: e.clientY };
    // Capture initial window position
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - startPos.current.x;
    const dy = e.clientY - startPos.current.y;
    updateWindow(windowId, {
      position: {
        x: startWindowPos.current.x + dx,
        y: startWindowPos.current.y + dy,
      }
    });
  };

  const onPointerUp = (e: React.PointerEvent) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    setIsDragging(false);
  };

  return {
    isDragging,
    dragHandleProps: { onPointerDown, onPointerMove, onPointerUp },
  };
}
```

### Resize
Same pattern as drag, but calculates delta from edge/corner and updates `size` instead of `position`. Direction parameter (`'n'`, `'s'`, `'e'`, `'w'`, `'ne'`, `'se'`, `'sw'`, `'nw'`) determines which dimensions change.

### Performance Considerations
- Use `will-change: transform` on windows during drag (remove after)
- Throttle state updates if needed (though pointer events are already optimized)
- Consider `requestAnimationFrame` batching for many simultaneous updates

### Touch & Mobile
- Pointer Events API handles mouse, touch, and pen uniformly
- `touchAction: 'none'` set on drag/resize handles
- ResizeHandles supports configurable `thickness` for larger touch targets

---

## Animation Support

### Philosophy
Glazier provides animation *hooks*, not built-in animations. Integrate with your preferred animation library (Framer Motion, CSS transitions, etc.).

### Example with Framer Motion
```tsx
function AnimatedWindow({ id, children }) {
  const { isDragging, isSnapping } = useWindowTransition(id);

  return (
    <Window id={id}>
      <motion.div
        animate={{
          scale: isDragging ? 1.02 : 1,
          transition: { duration: isSnapping ? 0.2 : 0 }
        }}
      >
        {children}
      </motion.div>
    </Window>
  );
}
```

---

## Non-Goals (v1)

- ~~Routing integration~~ → Hooks provided, full integration is consumer responsibility
- SSR/SEO handling (framework concern)
- File system abstraction
- Built-in applications
- Multi-monitor support
- Window tiling layouts (cascade, grid, etc.)
- Bundled themes
- Modal blocking behavior (planned v2)
- Window groups / tabs

---

## Example Usage

```tsx
import { 
  WindowManagerProvider, 
  Desktop, 
  Taskbar,
  useWindowManager 
} from 'react-desktop-os';

// 1. Define your app components
import { SettingsPanel } from './apps/SettingsPanel';
import { TerminalApp } from './apps/TerminalApp';
import { BrowserApp } from './apps/BrowserApp';

// 2. Create the registry
const registry = {
  settings: SettingsPanel,
  terminal: TerminalApp,
  browser: BrowserApp,
};

function App() {
  return (
    <WindowManagerProvider registry={registry}>
      <div className="app-container">
        <Desktop className="desktop">
          {/* Windows render here automatically */}
        </Desktop>
        <Taskbar>
          {({ windows, focusWindow }) => (
            <div className="taskbar">
              {windows.map(w => (
                <button key={w.id} onClick={() => focusWindow(w.id)}>
                  {w.title}
                </button>
              ))}
            </div>
          )}
        </Taskbar>
      </div>
    </WindowManagerProvider>
  );
}

function LaunchButton() {
  const { open } = useWindowManager();
  
  return (
    <button onClick={() => open({ 
      id: 'settings-1',        // Unique instance ID
      componentId: 'settings', // References registry key
      title: 'Settings',
      position: { x: 100, y: 100 },
      size: { width: 400, height: 300 }
    })}>
      Open Settings
    </button>
  );
}
```
