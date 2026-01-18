# Phase 10: Page Integration

**Updates:** `app/page.tsx`

**Depends on:** Phase 09 (mapper-flow)

---

## Overview

Integrate MapperProvider and MapperFlow into the main page with full-height layout.

---

## Implementation

```tsx
// app/page.tsx

import { MapperProvider } from "@/lib/mapper/context";
import { MapperFlow } from "@/components/mapper/mapper-flow";

export default function Home() {
    return (
        <main className="h-screen flex flex-col bg-background">
            <header className="shrink-0 border-b px-4 py-3">
                <h1 className="text-xl font-semibold">Data Mapper</h1>
            </header>
            <div className="flex-1 min-h-0 py-4">
                <MapperProvider>
                    <MapperFlow />
                </MapperProvider>
            </div>
        </main>
    );
}
```

---

## Layout Structure

```
+---------------------------+
|  Header (shrink-0)        |
+---------------------------+
|                           |
|  MapperFlow (flex-1)      |
|  - File uploads           |
|  - Tree views             |
|  - Connection lines       |
|  - Mapping list           |
|                           |
+---------------------------+
```

---

## CSS Considerations

`min-h-0` on flex-1 container ensures proper scroll behavior in nested flex layouts.

---

## Verification

- [x] Page renders without errors
- [x] Full viewport height utilized
- [x] Header stays fixed at top
- [x] Content area scrolls properly
- [x] All mapper functionality works

---

## Final Checklist

1. Upload JSON → tree renders
2. Upload XML → tree renders
3. Drag source → drop target → line appears
4. Multiple mappings → all lines visible
5. Click mapping/line → removes it
6. Scroll trees → lines stay connected
7. Expand/collapse → lines reposition
