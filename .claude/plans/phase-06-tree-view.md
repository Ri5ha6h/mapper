# Phase 06: Tree View

**Creates:** `components/mapper/tree-view.tsx`

**Depends on:** Phase 05 (tree-node), Phase 04 (context)

---

## Overview

Scrollable container for tree with expand/collapse all buttons. Tracks node refs for line positioning.

---

## Implementation

```tsx
// components/mapper/tree-view.tsx

"use client";

import { useCallback, useRef } from "react";
import { ChevronsUpDown, ChevronsDownUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TreeNode } from "./tree-node";
import { useMapper } from "@/lib/mapper/context";
import { collectNodeIds } from "@/lib/mapper/utils";
import type { TreeNode as TreeNodeType } from "@/lib/mapper/types";

interface TreeViewProps {
    tree: TreeNodeType | null;
    side: "source" | "target";
    onNodeRefs?: (refs: Map<string, HTMLElement>) => void;
}

export function TreeView({ tree, side, onNodeRefs }: TreeViewProps) {
    const { expandAll, collapseAll } = useMapper();
    const nodeRefsMap = useRef(new Map<string, HTMLElement>());

    const handleNodeRef = useCallback(
        (id: string, el: HTMLElement | null) => {
            if (el) {
                nodeRefsMap.current.set(id, el);
            } else {
                nodeRefsMap.current.delete(id);
            }
            onNodeRefs?.(nodeRefsMap.current);
        },
        [onNodeRefs]
    );

    const handleExpandAll = () => {
        if (!tree) return;
        const allIds = collectNodeIds(tree);
        expandAll(allIds);
    };

    const handleCollapseAll = () => {
        collapseAll();
    };

    if (!tree) {
        return <div className="flex items-center justify-center h-full text-muted-foreground">No file loaded</div>;
    }

    return (
        <div className="flex flex-col h-full">
            {/* Toolbar */}
            <div className="flex items-center gap-2 p-2 border-b">
                <Button variant="ghost" size="sm" onClick={handleExpandAll} className="h-7 px-2">
                    <ChevronsUpDown className="h-4 w-4 mr-1" />
                    Expand
                </Button>
                <Button variant="ghost" size="sm" onClick={handleCollapseAll} className="h-7 px-2">
                    <ChevronsDownUp className="h-4 w-4 mr-1" />
                    Collapse
                </Button>
            </div>

            {/* Tree content */}
            <ScrollArea className="flex-1">
                <div className="p-2">
                    <TreeNode node={tree} side={side} onNodeRef={handleNodeRef} />
                </div>
            </ScrollArea>
        </div>
    );
}
```

---

## Utils File

```typescript
// lib/mapper/utils.ts

import type { TreeNode } from "./types";

export function collectNodeIds(node: TreeNode | null): string[] {
    if (!node) return [];
    const ids = [node.id];
    if (node.children) {
        for (const child of node.children) {
            ids.push(...collectNodeIds(child));
        }
    }
    return ids;
}
```

---

## Features

- Empty state when no file loaded
- Expand/Collapse all buttons in toolbar
- ScrollArea for overflow handling
- Tracks all node DOM refs for line drawing

---

## Verification

- [x] Empty state shows when tree is null
- [x] Expand all expands every node
- [x] Collapse all collapses every node
- [x] Scroll works for large trees
- [x] Node refs callback fires on mount/unmount
