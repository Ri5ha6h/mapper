# Session Context

## User Prompts

### Prompt 1

Implement the following plan:

# Plan: Clear Mappings Button + Fix Tree Node Expand/Collapse

## Context
- Need a button to clear all mappings
- Expand/collapse toolbar should be removed; chevron toggles on tree nodes should be the primary mechanism
- **Bug**: chevron clicks don't work because dnd-kit drag listeners on parent div intercept `pointerdown` before `click` fires on the button

## Changes

### 1. Fix chevron toggle on tree nodes
**File:** `components/mapper/tree-node.tsx` (line 72-80)...

### Prompt 2

Create a plan for below and ask questions:
- If I collapse source tree node, target tree node also collapses. This should not happen. Each source and target tree node expand and collapse should be independent.

### Prompt 3

[Request interrupted by user for tool use]

