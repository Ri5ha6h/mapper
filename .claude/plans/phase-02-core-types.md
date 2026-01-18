# Phase 02: Core Types

**Creates:** `lib/mapper/types.ts`

---

## Overview

Define TypeScript interfaces for tree nodes, mappings, file data, and drag state.

---

## Implementation

```typescript
// lib/mapper/types.ts

export interface TreeNode {
    id: string; // path-based: "root.user.name"
    key: string; // display: "name"
    value?: string; // leaf value (primitives only)
    type: "object" | "array" | "primitive" | "xml-element" | "xml-attribute";
    children?: TreeNode[];
    depth: number;
}

export interface Mapping {
    id: string;
    sourceId: string; // TreeNode.id from source
    targetId: string; // TreeNode.id from target
}

export interface FileData {
    name: string;
    type: "json" | "xml";
    tree: TreeNode | null;
}

export type DragData = {
    nodeId: string;
    side: "source" | "target";
};

// Utility types
export type NodeType = TreeNode["type"];
export type FileType = FileData["type"];
```

---

## ID Format Examples

| Source          | ID                         |
| --------------- | -------------------------- |
| JSON object key | `root.users`               |
| JSON array item | `root.users[0]`            |
| JSON nested     | `root.users[0].name`       |
| XML element     | `root.person`              |
| XML attribute   | `root.person.@id`          |
| XML nested      | `root.person.address.city` |

---

## Verification

- [x] All interfaces exported
- [x] No circular dependencies
- [ ] Types match parser output format
