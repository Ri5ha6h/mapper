# Session Context

## User Prompts

### Prompt 1

Implement the following plan:

# Plan: Independent Expand/Collapse for Source & Target Trees

## Context
`expandedNodes` is a single `Set<string>` shared by both trees. Node IDs are path-based (`root.user.name`), so when source and target have overlapping structure, toggling one side affects the other.

## Changes

### 1. Split `expandedNodes` into per-side sets
**File:** `lib/mapper/context.tsx`

**State:** `expandedNodes: Set<string>` → `sourceExpanded: Set<string>; targetExpanded: Set<strin...

