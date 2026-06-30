# Architecture Documentation — Stage Diagram Editor

## Overview

**Stage Diagram Editor** is a Next.js 16 (App Router) application for creating and managing three types of technical diagrams:

1. **Signal Flow** — Signal flow diagrams showing audio/electronic signal routing
2. **Technical Rider** — Equipment lists with quantities and specifications
3. **Stage Plan** — Stage layout diagrams with shapes and rotation

The app is built with React 19, TypeScript, Tailwind CSS v4, and uses **@xyflow/react** (React Flow) as the diagramming engine. It exports as a static site (`output: "export"` in next.config.ts).

---

## Project Structure

```
D:\Github\stage-diagram\
├── app/                          # Next.js App Router pages
│   ├── layout.tsx                # Root layout with font + ZustandProvider
│   ├── page.tsx                  # Home page — main app shell
│   └── globals.css               # Global CSS with Tailwind + dark mode vars
│
├── src/
│   ├── types/
│   │   └── diagram.ts            # Shared type definitions
│   ├── store/
│   │   ├── useStore.ts           # Main diagram state (nodes, edges, templates)
│   │   ├── useStagePlanStore.ts  # Stage Plan-specific state
│   │   ├── useThemeStore.ts      # Theme (light/dark) state
│   │   └── useSaveAs.ts          # Save-as dialog state (in useStore)
│   ├── components/
│   │   ├── diagram/              # Canvas components
│   │   ├── nodes/                # Custom node types
│   │   ├── inspector/            # Property inspector panels
│   │   ├── toolbar/              # Toolbar with actions
│   │   ├── settings/             # Settings modal + SaveAsDialog
│   │   ├── help/                 # Help modal
│   │   ├── theme/                # Theme switcher
│   │   ├── tooltip/              # Tooltip component
│   │   ├── providers/            # React Flow provider wrapper
│   │   └── ...
│   ├── hooks/
│   │   ├── useProximityConnect.ts # Auto-connect proximity detection
│   │   └── useSaveAs.ts          # Save-as dialog hook for export points
│   ├── utils/
│   │   ├── projectIO.ts          # Export/Import project JSON
│   │   └── saveAs.ts             # Hybrid save utility (native picker + fallback)
│   └── lib/
│       └── utils.ts              # cn() utility (clsx + tailwind-merge)
│
├── next.config.ts                # Next.js config (output: "export")
├── tsconfig.json                 # TypeScript config with @/* path alias
├── postcss.config.mjs            # PostCSS config for Tailwind v4
└── eslint.config.mjs             # ESLint config
```

---

## Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.2.4 | Framework (App Router, static export) |
| React | 19.2.4 | UI library |
| TypeScript | ^5 | Type checking |
| @xyflow/react | ^12.10.2 | Diagramming engine (React Flow) |
| Zustand | ^5.0.12 | State management |
| Tailwind CSS | ^4 | Utility-first CSS |
| clsx + tailwind-merge | ^3.5.0 | Conditional class merging (`cn()` utility) |
| nanoid | ^5.1.9 | Unique ID generation |
| date-fns | ^4.1.0 | Date formatting |
| lucide-react | ^1.8.0 | Icon library |
| html-to-image | ^1.11.11 | Canvas-to-image export |
| jspdf | ^4.2.1 | PDF export |

---

## State Management Architecture

The app uses **three separate Zustand stores**:

### 1. `useStore` (`src/store/useStore.ts`) — Main Diagram State

The primary store managing Signal Flow / Technical Rider diagrams.

**State Properties:**

| Property | Type | Description |
|----------|------|-------------|
| `nodes` | `Node<CustomNodeData>[]` | All diagram nodes |
| `edges` | `Edge[]` | All connections between nodes |
| `selectedNodeIds` | `string[]` | Currently selected node IDs |
| `selectedEdgeIds` | `string[]` | Currently selected edge IDs |
| `templates` | `NodeTemplate[]` | Reusable node templates |
| `types` | `string[]` | Available node types (e.g., "Amplifier") |
| `locations` | `string[]` | Available locations (e.g., "Stage Left") |
| `cableTypes` | `string[]` | Available cable types (e.g., "XLR") |
| `undoStack` / `redoStack` | `HistoryState[]` | Undo/redo history (max 50 entries) |
| `isModalOpen` | `boolean` | Node creation modal visibility |
| `isSettingsModalOpen` | `boolean` | Settings modal visibility |
| `isNodeListModalOpen` | `boolean` | Node list modal visibility |
| `isHelpModalOpen` | `boolean` | Help modal visibility |
| `isSaveAsDialogOpen` | `boolean` | Save-as dialog visibility |
| `saveAsSuggestedName` | `string` | Default filename suggestion |
| `saveAsExtension` | `string` | File extension (e.g., "png", "json") |
| `saveAsOnConfirm` | `(filename: string) => void \| null` | Callback when user confirms filename |
| `saveAsOnClose` | `() => void \| null` | Callback when dialog closes |
| `saveAsNativeHandle` | `any \| null` | Native file handle (Chrome/Edge) |
| `pendingPosition` | `{x, y} \| null` | Canvas position for new node placement |
| `riderListTitle/Subtitle/PreparedBy` | `string` | Rider list header info |
| `canvasTitle/Subtitle/PreparedBy` | `string` | Canvas header info |
| `hideTitle` / `hideRiderTitle` / `hideDate` / `hideRiderDate` | `boolean` | Header visibility toggles |
| `locationGroupsEnabled` | `boolean` | Group nodes by location |
| `tempEdges` | `Edge[]` | Temporary proximity connection preview edges |
| `proximityPairs` | `ProximityPair[]` | Auto-connect proximity pairs |
| `proximityEdgeIds` | `string[]` | Edge IDs for auto-connected edges |

**Key Actions:**

- `addNode(type, position, label, inputsCount, outputsCount, typeProperty, locationProperty, power)` — Create a new node
- `copyNodes(nodeIds)` — Copy nodes with edges (with offset)
- `deleteNodes(nodeIds)` / `deleteEdge(edgeIds)` — Delete selected items
- `updateNodeLabel(nodeId, label)` / `updateNodeType(nodeIds, type)` — Update node properties
- `addTemplate(template)` / `applyTemplate(template, position)` — Template management
- `undo()` / `redo()` / `recordHistory()` — History management
- `restoreProjectState(state)` — Import project data
- `autoConnectEdges(pairs)` — Auto-connect proximity pairs
- `setSaveAsDialog(suggestedName, extension, onConfirm, onClose?)` — Open save-as dialog
- `closeSaveAsDialog()` — Close save-as dialog

### 2. `useStagePlanStore` (`src/store/useStagePlanStore.ts`) — Stage Plan State

Separate store for Stage Plan diagrams with additional shape/rotation capabilities.

**Additional Properties vs useStore:**

| Property | Type | Description |
|----------|------|-------------|
| `isStagePlanEnabled` | `boolean` | Switches between Signal Flow and Stage Plan views |
| `title` / `subtitle` / `preparedBy` | `string` | Stage Plan header info |
| `stagePlanNodes` | `Node<CustomNodeData>[]` | Stored stage plan nodes |
| `hideStagePlanTitle` / `hideStagePlanDate` | `boolean` | Stage Plan header visibility |

**Key Actions:**

- `matchNode(nodes)` — Sync nodes from main canvas to stage plan
- `updateNodeShape(nodeIds, shape)` — Set shape (rectangle/circle/triangle)
- `updateNodeRotation(nodeIds, rotation)` — Rotate nodes
- `updateNodeDimensions(nodeIds, width, height)` — Resize nodes
- `updateNodeStackingOrder(nodeIds, zIndex)` — Z-ordering

### 3. `useThemeStore` (`src/store/useThemeStore.ts`) — Theme State

Simple store managing light/dark theme.

| Property | Type | Description |
|----------|------|-------------|
| `theme` | `"light" \| "dark"` | Current theme |
| `setTheme(theme)` | `void` | Set theme |
| `toggleTheme()` | `void` | Toggle theme |

**Implementation:** Toggles `.dark` class on `document.documentElement`.

---

## Save-As Dialog Architecture

### Overview

All export points now support **custom filenames** via a hybrid approach:
- **Chrome/Edge:** Uses native `showSaveFilePicker()` Web API
- **Firefox/Safari:** Falls back to a custom modal dialog (`SaveAsDialog`)

### Components

#### `SaveAsDialog` (`src/components/settings/SaveAsDialog.tsx`)

Reusable modal component for browsers without native picker support.

**Props:**
```typescript
interface SaveAsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  suggestedName: string;
  extension: string;
  onConfirm: (filename: string) => void;
}
```

**Features:**
- Filename input with invalid character stripping (`< > : " / \ | ? *`)
- Disabled extension input shown as visual suffix
- Escape key and Cancel button close the dialog
- Renders via `createPortal()` to `document.body`

#### `useSaveAs` Hook (`src/hooks/useSaveAs.ts`)

Custom hook providing a simplified API for all export points:

```typescript
// Call ONCE at component level (NOT inside event handlers)
const saveAs = useSaveAs(suggestedName);

// Pass extension as parameter to each export handler
saveAs(extension, (filename: string) => {
  // Export logic using the chosen filename
});
```

**Usage pattern:**
1. Hook called at component level with suggested filename
2. Each export handler calls `saveAs(extension, callback)` passing the extension as a parameter
3. Store opens `SaveAsDialog` with state
4. User confirms or cancels
5. If confirmed: `onConfirm(filename)` is called, then dialog closes
6. Callback receives the full filename (with extension) and proceeds with export

**Important:** The hook must be called at the top level of a React component — never inside event handlers or regular functions, as this would cause an "Invalid hook call" error.

#### `saveAs` Utility (`src/utils/saveAs.ts`)

Hybrid save utility with two exported functions:

```typescript
// Shows native picker (Chrome/Edge) or returns null for fallback
showSaveAsDialog(suggestedName: string, extension: string): Promise<string | null>

// Writes file via native handle or fallback download
saveFile(blob: Blob, filename: string): Promise<void>

// Clears internal state (for cleanup)
resetSaveState(): void
```

**Native picker flow:**
1. `showSaveAsDialog()` calls `window.showSaveFilePicker()`
2. User selects location → returns filename
3. `saveFile()` writes via `handle.createWritable()`
4. State cleared after write

**Fallback flow:**
1. `showSaveAsDialog()` returns `null`
2. `SaveAsDialog` component shows modal
3. User enters filename → `onConfirm(filename)` called
4. Export logic creates blob and uses `<a>` download

### Export Points

| Component | Export Type | Title Source | Extension |
|-----------|-------------|--------------|-----------|
| `Toolbar` | Project JSON | `canvasTitle` / `stagePlanTitle` | `.json` |
| `ExportButton` | PNG | `canvasTitle` / `stagePlanTitle` | `.png` |
| `ExportButton` | JPG | `canvasTitle` / `stagePlanTitle` | `.jpg` |
| `ExportButton` | SVG | `canvasTitle` / `stagePlanTitle` | `.svg` |
| `ExportButton` | PDF | `canvasTitle` / `stagePlanTitle` | `.svg` (printed as PDF) |
| `NodeListModal` | PDF | `riderListTitle` | `.pdf` |
| `NodeListModal` | CSV | `riderListTitle` | `.csv` |
| `NodeListModal` | JSON | `riderListTitle` | `.json` |

---

## Type System

### `src/types/diagram.ts`

```typescript
interface NodeInput {
  id: string;       // Unique handle ID (nanoid)
  name: string;     // Display name
}

interface NodeOutput {
  id: string;
  name: string;
}

interface CustomNodeData {
  label: string;                    // Node display name
  inputs?: NodeInput[];             // Input handles
  outputs?: NodeOutput[];           // Output handles
  type?: string;                    // Node type property
  location?: string;                // Location/group identifier
  power?: boolean;                  // Requires power
  hidden?: boolean;                 // Visible on canvas
  exportingHidden?: boolean;        // Hidden during export
  hideFromList?: boolean;           // Hidden from NodeListModal
  shape?: "rectangle" | "circle" | "triangle";  // Stage Plan shape
  rotation?: number;                // Rotation in degrees
  width?: number;                   // Node width
  height?: number;                  // Node height
  zIndex?: number;                  // Stacking order
  [key: string]: unknown;           // Extensible
}

interface EdgeData {
  cableType: string;                // Cable type label on edge
  hidden?: boolean;                 // Hidden state
  exportingHidden?: boolean;        // Hidden during export
}

interface NodeTemplate {
  id: string;
  name: string;
  inputs: NodeInput[];
  outputs: NodeOutput[];
  type: string;                     // Node data.type
  nodeType: string;                 // React Flow node type ("custom")
  power: boolean;
}
```

### `src/utils/projectIO.ts` — Project State Interface

```typescript
interface ProjectState {
  templates: NodeTemplate[];
  nodes: Node<CustomNodeData>[];
  edges: Edge[];
  types: string[];
  locations: string[];
  cableTypes: string[];
  riderListTitle: string;
  riderListSubtitle: string;
  riderListPreparedBy: string;
  canvasTitle: string;
  canvasSubtitle: string;
  canvasPreparedBy: string;
  stagePlanTitle: string;
  stagePlanSubtitle: string;
  stagePlanPreparedBy: string;
  stagePlanNodes: Node<CustomNodeData>[];
}
```

---

## Component Architecture

### Root Layout (`app/layout.tsx`)

- Loads **Geist** and **Geist Mono** fonts with CSS variables
- Sets `metadata` with title "Stage Diagram Editor"
- Wraps children in `<ZustandProvider>` which wraps in `<ReactFlowProvider>`
- Applies dark mode via `document.documentElement.classList`

### Home Page (`app/page.tsx`) — Main App Shell

```
┌─────────────────────────────────────────────────────────────┐
│  [Toolbar - top-right]                                       │
│  ┌─────────────────────────────────┬──────────────────────┐ │
│  │                                 │                      │ │
│  │   [DiagramCanvas / StagePlan]   │  [PropertyInspector] │ │
│  │   (React Flow canvas)           │  (right sidebar)     │ │
│  │                                 │                      │ │
│  │   [Title overlay - bottom-left] │                      │ │
│  └─────────────────────────────────┴──────────────────────┘ │
│  [Modals: Settings, NodeList, Help, SaveAsDialog]            │
└─────────────────────────────────────────────────────────────┘
```

**Conditional rendering based on `isStagePlanEnabled`:**
- `false` → renders `<DiagramCanvas />` (Signal Flow)
- `true` → renders `<StagePlanCanvas />` (Stage Plan)

### Canvas Components

#### `DiagramCanvas` (`src/components/diagram/DiagramCanvas.tsx`)

Main Signal Flow canvas. Key features:

- **Node types:** `custom` (CustomNode), `group` (GroupNode)
- **Edge types:** `labeledBezierEdge`, `labeledSmoothstep`, `labeledStep`, `labeledStraight`, `tempEdge`
- **Proximity connect:** Detects handles within 150px when Q is held
- **Group by location:** Groups nodes sharing the same `data.location` value
- **Keyboard shortcuts:**
  - `Ctrl+Z` / `Ctrl+Y` — Undo/Redo
  - `Delete` / `Backspace` — Delete selected
  - `C` — Copy selected
  - `Space` / `Enter` — Open node creation modal
- **Live node tracking:** Uses `onNodeDrag` callback to track live positions for proximity detection
- **Title overlay:** Shows `canvasTitle`, `canvasSubtitle`, `canvasPreparedBy`, and date

#### `StagePlanCanvas` (`src/components/diagram/StagePlanCanvas.tsx`)

Stage Plan canvas with shape/rotation support:

- **Node types:** `custom` (StagePlanNode), `group` (GroupNode)
- **Node sync:** `matchNode()` syncs nodes from main canvas on mount
- **No edges:** Stage Plan has no edge connections
- **Node features:** Resize handles, rotation handle (drag to rotate)
- **Shapes:** Rectangle, circle, triangle (SVG-based)

### Node Components

#### `CustomNode` (`src/components/nodes/CustomNode.tsx`)

Standard signal flow node:
- Displays `data.label` as title
- Renders `data.inputs` (left) and `data.outputs` (right) as `<LabeledHandle>` components
- Uses `useUpdateNodeInternals()` to force re-render when handles change
- Applies `hidden` (opacity-30) and `exportingHidden` (return null) states
- Selection state: blue border + ring

#### `StagePlanNode` (`src/components/nodes/StagePlanNode.tsx`)

Stage plan node with shape/rotation:
- **Shape rendering:** SVG-based shapes (rectangle/circle/triangle)
- **Rotation:** Pointer event-based rotation handle at top center
- **Resizing:** `<NodeResizer>` from React Flow when selected
- **Dimensions:** Stores `width`/`height` in `data` for persistence

#### `GroupNode` (`src/components/nodes/GroupNode.tsx`)

Visual grouping container:
- Renders a header label (`data.label`)
- Used when `locationGroupsEnabled` is true
- Groups nodes by `data.location` value

#### `LabeledHandle` / `BaseHandle`

React Flow handles with labels:
- `LabeledHandle` wraps `BaseHandle` with a text label
- Position-based flex layout (top/bottom/left/right)

### Edge Components (`src/components/diagram/LabeledEdge.tsx`)

Custom edge renderers that combine React Flow edges with labels:

| Edge Type | Base | Description |
|-----------|------|-------------|
| `labeledBezierEdge` | `BezierEdge` | Smooth curved connection |
| `labeledSmoothstepEdge` | `SmoothStepEdge` | 90° angled connection |
| `labeledStepEdge` | `StepEdge` | 45° angled connection |
| `labeledStraightEdge` | `StraightEdge` | Straight line |
| `tempEdge` | `BezierEdge` | Dashed preview for proximity connect |

All edges show `data.cableType` as a label at the midpoint. Edges with `exportingHidden: true` return `null`.

### Inspector Components (`src/components/inspector/`)

**`PropertyInspector`** — Router component that shows the appropriate panel:

```typescript
if (isStagePlanEnabled && stagePlanSelectedNodeIds.length > 0)
  → <StagePlanPropertiesPanel />
if (selectedNodeIds.length > 0)
  → <PropertiesPanel />
if (selectedEdgeIds.length > 0)
  → <EdgePropertiesPanel />
else
  → <TemplateList />
```

### Toolbar (`src/components/toolbar/Toolbar.tsx)

Vertical toolbar (top-right) with buttons:

| Button | Icon | Action |
|--------|------|--------|
| Add Node | `Plus` | Opens `NodeCreationModal` |
| Undo | `Undo` | Calls `undo()` on active store |
| Redo | `Redo` | Calls `redo()` on active store |
| List | `List` | Opens `NodeListModal` |
| Stage Plan | `Layers`/`Workflow` | Toggles `isStagePlanEnabled` |
| Import | `Upload` | Opens file picker for JSON |
| Export | `Download` | Opens export format dropdown |
| Settings | `Settings` | Opens `SettingsModal` |
| Theme | `ThemeSwitcher` | Toggles dark/light |
| Help | `HelpCircle` | Opens `HelpModal` |

### Modals

All modals use `createPortal()` to render in `document.body` for proper z-index stacking.

#### `NodeCreationModal`

Creates nodes with:
- Name
- Type (from `useStore.types`, creatable inline)
- Location (from `useStore.locations`, creatable inline)
- Input count
- Output count

#### `SettingsModal`

Manages:
- **Lists:** Types, Locations, Cable Types (add/remove)
- **Rider List settings:** Title, Subtitle, Prepared By, hide title/date
- **Signal Flow settings:** Title, Subtitle, Prepared By, hide title/date
- **Stage Plan settings:** Title, Subtitle, Prepared By, hide title/date

#### `SaveAsDialog`

Save-as dialog for custom filenames:
- Filename input with invalid character stripping
- Disabled extension suffix display
- Escape key support
- Used when native picker is unavailable

#### `ExportButton`

Dropdown with export formats:
- **PNG** — `toPng()` from html-to-image
- **JPG** — `toJpeg()` (forces white background)
- **SVG** — `toSvg()`
- **PDF** — SVG → print window with A4 landscape

**Export process:**
1. `useSaveAs` is called ONCE at component level with the project title as suggested name
2. Each export handler (`exportAsPng`, `exportAsJpeg`, etc.) calls `saveAs(extension, callback)` passing the extension as a parameter
3. `saveAs` opens save-as dialog (native picker or modal)
4. User confirms filename
5. Callback receives the filename and calls `runExport()` which captures the canvas and downloads with the chosen filename
6. Restore visibility of hidden nodes/edges

---

## Proximity Connect Hook (`src/hooks/useProximityConnect.ts`)

Enables automatic edge creation when handles are near each other.

**Activation:** Hold **Q** key

**Modes:**
- **Q alone:** Smart matching — pairs closest handle pairs (one-to-one)
- **Q + A:** All-to-all — connects all qualifying pairs

**Algorithm:**
1. Calculate handle centers for all nodes
2. Find all input/output pairs within 150px distance
3. Filter: output must be to the left of input (`output.x <= input.x`)
4. Exclude already-connected handles
5. Sort by distance (for smart mode)
6. Return pairs to callback

**Output:** `ProximityPair[]` with `source`, `target`, `sourceNodeId`, `targetNodeId`

---

## Project I/O (`src/utils/projectIO.ts`)

### Export (`exportProject`)

1. Reads all state from both stores
2. Serializes to JSON
3. Creates blob and triggers download as `project.json` or `customFilename`

### Import (`importProject`)

1. Reads file content
2. Parses JSON
3. Validates required fields: `templates`, `nodes`, `edges` arrays
4. Returns `ProjectState` for restoration

### Restoration

- `useStore.restoreProjectState()` — Restores main canvas state
- `useStagePlanStore.restoreProjectState()` — Restores stage plan state

---

## CSS/Theme System

### `app/globals.css`

```css
:root {
  --background: #ffffff;
  --foreground: #171717;
  --react-flow-edge: #b1b1b7;
  --react-flow-background: #f8f8f8;
  --react-flow-dots: #aaa;
  --react-flow-controls-bg: #ffffff;
  --react-flow-controls-border: #e2e8f0;
  --react-flow-controls-text: #1e293b;
}

.dark {
  --background: #0a0a0a;
  --foreground: #ededed;
  --react-flow-edge: #555555;
  --react-flow-background: #1a1a1a;
  --react-flow-dots: #333;
  --react-flow-controls-bg: #1e293b;
  --react-flow-controls-border: #334155;
  --react-flow-controls-text: #f8fafc;
}

@variant dark (&:where(.dark, .dark *));
```

### `cn()` Utility (`src/lib/utils.ts`)

```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

Merges conditional classes without conflicts — used throughout the codebase for dynamic styling.

---

## Configuration Files

### `next.config.ts`

```typescript
const nextConfig: NextConfig = {
  output: "export",  // Static site export
};
```

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "strict": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]  // Path alias
    }
  }
}
```

### `package.json` Scripts

| Script | Command |
|--------|---------|
| `dev` | `next dev` |
| `build` | `next build` |
| `start` | `next start` |
| `lint` | `eslint` |

---

## Data Flow Summary

```
User Action
    │
    ├── Keyboard Shortcut
    │   └── → Window event handler → Store action (undo/redo/delete/copy)
    │
    ├── Node Creation
    │   └── → NodeCreationModal → onCreate → addNode() → Store update
    │
    ├── Drag/Drop
    │   └── → React Flow events → onNodesChange/onEdgesChange → Store update
    │
    ├── Selection
    │   └── → onNodeClick/onEdgeClick → setSelectedNodeIds/setSelectedEdgeIds
    │
    ├── Proximity Connect (Q key)
    │   └── → useProximityConnect → autoConnectEdges() → Store update
    │
    ├── Export
    │   ├── Project JSON → exportProject(filename) → Download
    │   ├── Canvas → html-to-image → downloadFile(filename) → Download
    │   ├── Node List PDF → exportToPdf(..., filename) → jsPDF.save(filename)
    │   ├── Node List CSV → exportToCsv(..., filename) → Download
    │   └── Node List JSON → exportToJson(..., filename) → Download
    │
    ├── Save-As Dialog
    │   ├── Native Picker (Chrome/Edge) → showSaveFilePicker() → handle.createWritable()
    │   └── Fallback Modal (Firefox/Safari) → SaveAsDialog → onConfirm(filename)
    │
    └── Import
        └── → importProject() → restoreProjectState() → Store update
```

---

## Key Patterns & Conventions

1. **Unidirectional data flow** — All state changes go through Zustand stores
2. **Path aliases** — `@/` maps to `src/` for cleaner imports
3. **Portal modals** — All modals use `createPortal()` to `document.body`
4. **Shallow selectors** — `useStore(useShallow((state) => {...}))` for bulk subscriptions
5. **History tracking** — Max 50 entries per undo/redo stack
6. **Export hiding** — `exportingHidden` flag for temporary visibility during export
7. **Theme via CSS class** — `.dark` on `document.documentElement`
8. **Dynamic node types** — `nodeTypes` object maps React Flow type names to components
9. **Group nodes** — Computed from `data.location` when `locationGroupsEnabled` is true
10. **Proximity thresholds** — 150px minimum distance for auto-connect
11. **Hybrid save strategy** — Native picker when available, modal fallback for compatibility
12. **Filename sanitization** — Strips `< > : " / \ | ? *` from user input
13. **Extension as suffix** — Extension shown as disabled input after filename textbox
14. **Title-based defaults** — Uses `canvasTitle`/`stagePlanTitle`/`riderListTitle` for default filenames
15. **Hook placement** — `useSaveAs` hook must be called at the component level, never inside event handlers or regular functions (prevents "Invalid hook call" error)

---

## Browser Compatibility Notes

### `showSaveFilePicker()` API

| Browser | Support | Fallback |
|---------|---------|----------|
| Chrome/Edge | ✅ Native picker | — |
| Firefox | ❌ | SaveAsDialog modal |
| Safari | ❌ | SaveAsDialog modal |

**Requirements:**
- HTTPS or `localhost` (won't work with `file://` protocol)
- User gesture (click/tap) to trigger

### Static Export Considerations

Since the app uses `output: "export"`, it's typically opened via `file://` protocol or a local server. The native picker won't work with `file://`, so Firefox/Safari users will always see the modal dialog.
