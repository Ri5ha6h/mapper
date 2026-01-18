# Phase 07: File Upload

**Creates:** `components/mapper/file-upload.tsx`

**Depends on:** Phase 03 (parsers), Phase 04 (context)

---

## Overview

File input component for JSON/XML files. Parses on select, displays filename, has clear button.

---

## Implementation

```tsx
// components/mapper/file-upload.tsx

"use client";

import { useRef } from "react";
import { Upload, X, FileJson, FileCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMapper } from "@/lib/mapper/context";
import { detectFileType, parseJSON, parseXML } from "@/lib/mapper/parsers";
import type { FileData } from "@/lib/mapper/types";

interface FileUploadProps {
    side: "source" | "target";
}

export function FileUpload({ side }: FileUploadProps) {
    const { source, target, setSource, setTarget } = useMapper();
    const inputRef = useRef<HTMLInputElement>(null);

    const fileData = side === "source" ? source : target;
    const setFileData = side === "source" ? setSource : setTarget;

    const handleClick = () => {
        inputRef.current?.click();
    };

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const content = await file.text();
            const type = detectFileType(content);
            const tree = type === "json" ? parseJSON(content) : parseXML(content);

            const data: FileData = {
                name: file.name,
                type,
                tree,
            };

            setFileData(data);
        } catch (err) {
            console.error("Failed to parse file:", err);
            // Could add toast notification here
        }

        // Reset input so same file can be re-selected
        e.target.value = "";
    };

    const handleClear = () => {
        setFileData(null);
    };

    const FileIcon = fileData?.type === "xml" ? FileCode : FileJson;

    return (
        <div className="flex items-center gap-2">
            <input ref={inputRef} type="file" accept=".json,.xml" onChange={handleChange} className="hidden" />

            {fileData ? (
                <>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-md">
                        <FileIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium truncate max-w-[150px]">{fileData.name}</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleClear} className="h-8 w-8">
                        <X className="h-4 w-4" />
                    </Button>
                </>
            ) : (
                <Button variant="outline" onClick={handleClick}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload {side === "source" ? "Source" : "Target"}
                </Button>
            )}
        </div>
    );
}
```

---

## File Type Icons

- JSON files: `FileJson` icon
- XML files: `FileCode` icon

---

## Error Handling

- Parse errors logged to console
- Input reset after selection (allows re-selecting same file)
- Could extend with toast notifications for user feedback

---

## Verification

- [x] Component created at `components/mapper/file-upload.tsx`
- [x] TypeScript compilation passes
- [x] All dependencies imported correctly (useMapper, parsers, icons, Button)
- [x] File input handler implemented with async file reading
- [x] File type detection integrated
- [x] JSON/XML parsing integrated
- [x] Clear functionality implemented
- [x] Input reset after selection (allows re-selecting same file)
- [ ] Click button opens file picker (manual test)
- [ ] JSON files parse correctly (manual test)
- [ ] XML files parse correctly (manual test)
- [ ] Filename displayed after upload (manual test)
- [ ] Clear button removes file (manual test)
- [ ] Same file can be re-uploaded after clear (manual test)
