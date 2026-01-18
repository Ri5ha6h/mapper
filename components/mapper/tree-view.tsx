"use client";

import { ChevronsUpDown, ChevronsDownUp } from "lucide-react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMapper } from "@/lib/mapper/context";
import type { TreeNode as TreeNodeType } from "@/lib/mapper/types";
import { collectNodeIds } from "@/lib/mapper/utils";
import { TreeNode } from "./tree-node";

interface TreeViewProps {
    tree: TreeNodeType | null;
    side: "source" | "target";
    onNodeRefs?: (refs: Map<string, HTMLElement>) => void;
}

export function TreeView({ tree, side, onNodeRefs }: TreeViewProps) {
    const { expandAll, collapseAll } = useMapper();
    const nodeRefsMap = useRef(new Map<string, HTMLElement>());

    const handleNodeRef = (id: string, el: HTMLElement | null) => {
        if (el) {
            nodeRefsMap.current.set(id, el);
        } else {
            nodeRefsMap.current.delete(id);
        }
        onNodeRefs?.(nodeRefsMap.current);
    };

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
