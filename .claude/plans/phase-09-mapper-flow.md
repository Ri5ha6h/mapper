# Phase 09: Main Mapper Flow

**Creates:** `components/mapper/mapper-flow.tsx`

**Depends on:** All previous phases

---

## Overview

Main component combining file uploads, tree views, connection lines, and mapping list.

---

## Layout

```
+--------------------------------------------------+
|  [Source Upload]           [Target Upload]       |
+--------------------------------------------------+
|  +----------------+       +----------------+     |
|  | Source Tree    |  ~~~> | Target Tree    |     |
|  | (Draggable)    |       | (Droppable)    |     |
|  +----------------+       +----------------+     |
+--------------------------------------------------+
|  Mappings:                                       |
|  • source.field → target.field              [x]  |
|  • source.other → target.other              [x]  |
+--------------------------------------------------+
```

---

## Implementation

```tsx
// components/mapper/mapper-flow.tsx

"use client";

import { useRef, useState, useCallback } from "react";
import { DndContext, DragEndEvent, DragOverlay, pointerWithin } from "@dnd-kit/core";
import { X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileUpload } from "./file-upload";
import { TreeView } from "./tree-view";
import { ConnectionLines } from "./connection-lines";
import { useMapper } from "@/lib/mapper/context";
import type { DragData } from "@/lib/mapper/types";

export function MapperFlow() {
    const { source, target, mappings, addMapping, removeMapping } = useMapper();
    const containerRef = useRef<HTMLDivElement>(null);

    const [sourceRefs, setSourceRefs] = useState<Map<string, HTMLElement>>(new Map());
    const [targetRefs, setTargetRefs] = useState<Map<string, HTMLElement>>(new Map());
    const [activeId, setActiveId] = useState<string | null>(null);

    const handleSourceRefs = useCallback((refs: Map<string, HTMLElement>) => {
        setSourceRefs(new Map(refs));
    }, []);

    const handleTargetRefs = useCallback((refs: Map<string, HTMLElement>) => {
        setTargetRefs(new Map(refs));
    }, []);

    const handleDragStart = (event: { active: { id: string } }) => {
        setActiveId(String(event.active.id));
    };

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveId(null);

        const { active, over } = event;
        if (!over) return;

        const activeData = active.data.current as DragData | undefined;
        const overData = over.data.current as DragData | undefined;

        // Must be dragging from source to target
        if (activeData?.side !== "source" || overData?.side !== "target") return;

        addMapping(activeData.nodeId, overData.nodeId);
    };

    return (
        <DndContext collisionDetection={pointerWithin} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="flex flex-col h-full gap-4">
                {/* Upload row */}
                <div className="flex items-center justify-between px-4">
                    <FileUpload side="source" />
                    <FileUpload side="target" />
                </div>

                {/* Trees container */}
                <div ref={containerRef} className="flex-1 relative flex gap-4 px-4 min-h-0">
                    {/* Source tree */}
                    <Card className="flex-1 overflow-hidden">
                        <div className="p-2 border-b bg-muted/50">
                            <span className="text-sm font-medium">Source</span>
                        </div>
                        <div className="h-[calc(100%-40px)]">
                            <TreeView tree={source?.tree ?? null} side="source" onNodeRefs={handleSourceRefs} />
                        </div>
                    </Card>

                    {/* Connection lines */}
                    <ConnectionLines
                        sourceRefs={sourceRefs}
                        targetRefs={targetRefs}
                        containerRef={containerRef as React.RefObject<HTMLElement>}
                    />

                    {/* Target tree */}
                    <Card className="flex-1 overflow-hidden">
                        <div className="p-2 border-b bg-muted/50">
                            <span className="text-sm font-medium">Target</span>
                        </div>
                        <div className="h-[calc(100%-40px)]">
                            <TreeView tree={target?.tree ?? null} side="target" onNodeRefs={handleTargetRefs} />
                        </div>
                    </Card>
                </div>

                {/* Mappings list */}
                <Card className="mx-4 mb-4">
                    <div className="p-2 border-b bg-muted/50">
                        <span className="text-sm font-medium">Mappings ({mappings.length})</span>
                    </div>
                    <ScrollArea className="max-h-[150px]">
                        {mappings.length === 0 ? (
                            <div className="p-4 text-center text-sm text-muted-foreground">
                                Drag from source to target to create mappings
                            </div>
                        ) : (
                            <div className="p-2 space-y-1">
                                {mappings.map((mapping) => (
                                    <div
                                        key={mapping.id}
                                        className="flex items-center justify-between px-3 py-2 rounded-md bg-muted/50 hover:bg-muted"
                                    >
                                        <div className="flex items-center gap-2 text-sm font-mono">
                                            <span className="text-green-600 dark:text-green-400">
                                                {formatNodeId(mapping.sourceId)}
                                            </span>
                                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                            <span className="text-blue-600 dark:text-blue-400">
                                                {formatNodeId(mapping.targetId)}
                                            </span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeMapping(mapping.id)}
                                            className="h-6 w-6"
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </Card>
            </div>

            {/* Drag overlay */}
            <DragOverlay>
                {activeId && (
                    <div className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm shadow-lg">
                        {activeId.replace("drag-", "")}
                    </div>
                )}
            </DragOverlay>
        </DndContext>
    );
}

function formatNodeId(id: string): string {
    // Remove "root." prefix for display
    return id.replace(/^root\.?/, "") || "root";
}
```

---

## Index Export

```typescript
// components/mapper/index.ts

export { MapperFlow } from "./mapper-flow";
export { MapperProvider } from "@/lib/mapper/context";
```

---

## Key Features

- DndContext wraps entire component
- `pointerWithin` collision detection for accurate drop targets
- DragOverlay shows node being dragged
- Mapping list with formatted paths and remove button
- Connection lines rendered over trees

---

## Verification

- [x] Drag from source tree works
- [x] Drop on target tree creates mapping
- [x] Connection lines appear
- [x] Mapping shows in list
- [x] Remove button works
- [x] Click line removes mapping
- [x] Multiple mappings supported
