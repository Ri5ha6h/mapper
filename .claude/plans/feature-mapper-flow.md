# Mapper Flow Implementation Plan

Two-panel tree view for mapping nodes between source/target files (JSON/XML). Uses dnd-kit for drag interactions, custom SVG for connection lines.

---

## Phase 1: Dependencies

```bash
pnpm add fast-xml-parser
```

**Already installed:** `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/modifiers`

**Why fast-xml-parser:** Zero-dependency, fast, excellent TS support, handles attributes/elements well.

**Why no react-xarrows:** Custom SVG = smaller bundle, full control, better perf.

---

## Phase 2: Core Types

Create `/lib/mapper/types.ts`

```typescript
interface TreeNode {
    id: string; // path-based: "root.user.name"
    key: string; // display: "name"
    value?: string; // leaf value
    type: "object" | "array" | "primitive" | "xml-element" | "xml-attribute";
    children?: TreeNode[];
    depth: number;
}

interface Mapping {
    id: string;
    sourceId: string;
    targetId: string;
}

interface FileData {
    name: string;
    type: "json" | "xml";
    tree: TreeNode | null;
}
```

---

## Phase 3: Parsers

Create `/lib/mapper/parsers.ts`

- `parseJSON(content: string): TreeNode` - recursive JSON→tree
- `parseXML(content: string): TreeNode` - fast-xml-parser→tree
- `detectFileType(content: string): "json" | "xml"`

Path-based IDs: `root.users[0].name`, `root.person.@id` (@ for XML attributes)

---

## Phase 4: State Context

Create `/lib/mapper/context.tsx`

State: source, target, mappings[], activeDragId, expandedNodes

Actions: setSource, setTarget, addMapping, removeMapping, toggleExpand

---

## Phase 5: Tree Node Component

Create `/components/mapper/tree-node.tsx`

- Expand/collapse chevron
- Key + value display
- Type icon (object/array/element)
- `useDraggable` for source side
- `useDroppable` for target side
- Drag hover highlight

---

## Phase 6: Tree View Component

Create `/components/mapper/tree-view.tsx`

- Recursive TreeNode renderer
- Scrollable container
- Stores DOM refs for line positioning

---

## Phase 7: File Upload Panel

Create `/components/mapper/file-upload.tsx`

- Upload button (accepts .json, .xml)
- File name display + clear
- Auto-parse on upload

---

## Phase 8: Connection Lines

Create `/components/mapper/connection-lines.tsx`

- Absolute positioned SVG overlay
- `getBoundingClientRect()` for node positions
- Curved bezier paths
- Updates on scroll/resize/expand

---

## Phase 9: Main Mapper Component

Create `/components/mapper/mapper-flow.tsx`

```
+------------------------------------------+
|  [Source Upload]      [Target Upload]    |
+------------------------------------------+
|  +--------------+    +--------------+    |
|  | Tree View    | ~> | Tree View    |    |
|  | (Draggable)  |    | (Droppable)  |    |
|  +--------------+    +--------------+    |
+------------------------------------------+
|  Mappings: src.field -> tgt.field [x]   |
+------------------------------------------+
```

- DndContext wrapper
- onDragEnd creates mappings

---

## Phase 10: Page Integration

Update `/app/page.tsx` - render MapperFlow with MapperProvider

---

## File Structure

```
lib/mapper/
  types.ts
  parsers.ts
  context.tsx

components/mapper/
  file-upload.tsx
  tree-node.tsx
  tree-view.tsx
  connection-lines.tsx
  mapper-flow.tsx
```

---

## Verification

1. Upload JSON file → tree renders correctly
2. Upload XML file → tree renders correctly
3. Drag source node → drop on target → line appears
4. Multiple mappings → all lines visible
5. Click mapping → removes it
6. Scroll trees → lines stay connected
7. Expand/collapse → lines reposition

---

## Decisions

- **Export:** JSON format - array of {sourceId, targetId} pairs
- **Validation:** Warn on type mismatch (allow mapping but show warning)
- **Persistence:** Skip for MVP

## Out of Scope (for later)

- Multi-select mapping
- Undo/redo
- localStorage persistence
