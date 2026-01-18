# Phase 08: Connection Lines

**Creates:** `components/mapper/connection-lines.tsx`

**Depends on:** Phase 04 (context)

---

## Overview

SVG overlay drawing bezier curves between mapped nodes. Updates on scroll, resize, expand/collapse.

---

## Implementation

```tsx
// components/mapper/connection-lines.tsx

"use client";

import { useEffect, useState, useCallback } from "react";
import { useMapper } from "@/lib/mapper/context";

interface ConnectionLinesProps {
    sourceRefs: Map<string, HTMLElement>;
    targetRefs: Map<string, HTMLElement>;
    containerRef: React.RefObject<HTMLElement>;
}

interface Line {
    id: string;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

export function ConnectionLines({ sourceRefs, targetRefs, containerRef }: ConnectionLinesProps) {
    const { mappings, removeMapping } = useMapper();
    const [lines, setLines] = useState<Line[]>([]);

    const updateLines = useCallback(() => {
        if (!containerRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        const newLines: Line[] = [];

        for (const mapping of mappings) {
            const sourceEl = sourceRefs.get(mapping.sourceId);
            const targetEl = targetRefs.get(mapping.targetId);

            if (!sourceEl || !targetEl) continue;

            const sourceRect = sourceEl.getBoundingClientRect();
            const targetRect = targetEl.getBoundingClientRect();

            // Right edge of source → left edge of target
            const x1 = sourceRect.right - containerRect.left;
            const y1 = sourceRect.top + sourceRect.height / 2 - containerRect.top;
            const x2 = targetRect.left - containerRect.left;
            const y2 = targetRect.top + targetRect.height / 2 - containerRect.top;

            newLines.push({
                id: mapping.id,
                x1,
                y1,
                x2,
                y2,
            });
        }

        setLines(newLines);
    }, [mappings, sourceRefs, targetRefs, containerRef]);

    // Update on mappings change
    useEffect(() => {
        updateLines();
    }, [updateLines]);

    // Update on scroll/resize
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Observe scroll on tree containers
        const scrollAreas = container.querySelectorAll("[data-radix-scroll-area-viewport]");

        const handleUpdate = () => {
            requestAnimationFrame(updateLines);
        };

        scrollAreas.forEach((area) => {
            area.addEventListener("scroll", handleUpdate);
        });

        window.addEventListener("resize", handleUpdate);

        // MutationObserver for expand/collapse
        const observer = new MutationObserver(handleUpdate);
        observer.observe(container, {
            childList: true,
            subtree: true,
        });

        return () => {
            scrollAreas.forEach((area) => {
                area.removeEventListener("scroll", handleUpdate);
            });
            window.removeEventListener("resize", handleUpdate);
            observer.disconnect();
        };
    }, [containerRef, updateLines]);

    const handleLineClick = (mappingId: string) => {
        removeMapping(mappingId);
    };

    return (
        <svg className="absolute inset-0 pointer-events-none overflow-visible" style={{ zIndex: 10 }}>
            <defs>
                <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="hsl(var(--primary))" />
                    <stop offset="100%" stopColor="hsl(var(--primary))" />
                </linearGradient>
            </defs>

            {lines.map((line) => {
                // Bezier control points
                const dx = Math.abs(line.x2 - line.x1) * 0.5;
                const path = `M ${line.x1} ${line.y1} C ${line.x1 + dx} ${line.y1}, ${line.x2 - dx} ${line.y2}, ${line.x2} ${line.y2}`;

                return (
                    <g key={line.id}>
                        {/* Invisible wider path for easier clicking */}
                        <path
                            d={path}
                            fill="none"
                            stroke="transparent"
                            strokeWidth={12}
                            className="pointer-events-auto cursor-pointer"
                            onClick={() => handleLineClick(line.id)}
                        />
                        {/* Visible path */}
                        <path
                            d={path}
                            fill="none"
                            stroke="url(#line-gradient)"
                            strokeWidth={2}
                            className="transition-all"
                        />
                        {/* Dots at endpoints */}
                        <circle cx={line.x1} cy={line.y1} r={4} fill="hsl(var(--primary))" />
                        <circle cx={line.x2} cy={line.y2} r={4} fill="hsl(var(--primary))" />
                    </g>
                );
            })}
        </svg>
    );
}
```

---

## Line Calculation

- Source: right edge of node element
- Target: left edge of node element
- Y: vertical center of each node
- Bezier curves: horizontal control points at 50% of x distance

---

## Update Triggers

1. Mappings array changes
2. Scroll events in tree containers
3. Window resize
4. DOM mutations (expand/collapse)

---

## Click to Remove

- Invisible wider stroke (12px) for click target
- Visible stroke (2px) for display
- Click removes the mapping

---

## Verification

- [x] Lines render between mapped nodes
- [x] Lines update on scroll
- [x] Lines update on resize
- [x] Lines update on expand/collapse
- [x] Click on line removes mapping
- [x] Multiple lines render correctly
