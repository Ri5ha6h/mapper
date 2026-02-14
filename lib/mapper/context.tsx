"use client";

import { createContext, useContext, useReducer, type ReactNode } from "react";
import type { FileData, Mapping } from "./types";

interface MapperState {
    source: FileData | null;
    target: FileData | null;
    mappings: Mapping[];
    expandedNodes: Set<string>;
}

type MapperAction =
    | { type: "SET_SOURCE"; payload: FileData | null }
    | { type: "SET_TARGET"; payload: FileData | null }
    | { type: "ADD_MAPPING"; payload: Mapping }
    | { type: "REMOVE_MAPPING"; payload: string }
    | { type: "SET_MAPPINGS"; payload: Mapping[] }
    | { type: "TOGGLE_EXPAND"; payload: string }
    | { type: "EXPAND_ALL"; payload: string[] }
    | { type: "COLLAPSE_ALL" };

const initialState: MapperState = {
    source: null,
    target: null,
    mappings: [],
    expandedNodes: new Set(),
};

function mapperReducer(state: MapperState, action: MapperAction): MapperState {
    switch (action.type) {
        case "SET_SOURCE":
            return {
                ...state,
                source: action.payload,
                mappings: [], // clear mappings on source change
            };

        case "SET_TARGET":
            return {
                ...state,
                target: action.payload,
                mappings: [], // clear mappings on target change
            };

        case "ADD_MAPPING": {
            // prevent duplicates
            const exists = state.mappings.some(
                (m) => m.sourceId === action.payload.sourceId && m.targetId === action.payload.targetId
            );
            if (exists) return state;
            return {
                ...state,
                mappings: [...state.mappings, action.payload],
            };
        }

        case "REMOVE_MAPPING":
            return {
                ...state,
                mappings: state.mappings.filter((m) => m.id !== action.payload),
            };

        case "SET_MAPPINGS":
            return {
                ...state,
                mappings: action.payload,
            };

        case "TOGGLE_EXPAND": {
            const next = new Set(state.expandedNodes);
            if (next.has(action.payload)) {
                next.delete(action.payload);
            } else {
                next.add(action.payload);
            }
            return { ...state, expandedNodes: next };
        }

        case "EXPAND_ALL":
            return { ...state, expandedNodes: new Set(action.payload) };

        case "COLLAPSE_ALL":
            return { ...state, expandedNodes: new Set() };

        default:
            return state;
    }
}

interface MapperContextValue extends MapperState {
    setSource: (data: FileData | null) => void;
    setTarget: (data: FileData | null) => void;
    addMapping: (sourceId: string, targetId: string) => void;
    removeMapping: (id: string) => void;
    setMappings: (mappings: Mapping[]) => void;
    toggleExpand: (nodeId: string) => void;
    expandAll: (nodeIds: string[]) => void;
    collapseAll: () => void;
}

const MapperContext = createContext<MapperContextValue | null>(null);

export function MapperProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(mapperReducer, initialState);

    const setSource = (data: FileData | null) => {
        dispatch({ type: "SET_SOURCE", payload: data });
    };

    const setTarget = (data: FileData | null) => {
        dispatch({ type: "SET_TARGET", payload: data });
    };

    const addMapping = (sourceId: string, targetId: string) => {
        const mapping: Mapping = {
            id: `${sourceId}::${targetId}`,
            sourceId,
            targetId,
        };
        dispatch({ type: "ADD_MAPPING", payload: mapping });
    };

    const removeMapping = (id: string) => {
        dispatch({ type: "REMOVE_MAPPING", payload: id });
    };

    const setMappings = (mappings: Mapping[]) => {
        dispatch({ type: "SET_MAPPINGS", payload: mappings });
    };

    const toggleExpand = (nodeId: string) => {
        dispatch({ type: "TOGGLE_EXPAND", payload: nodeId });
    };

    const expandAll = (nodeIds: string[]) => {
        dispatch({ type: "EXPAND_ALL", payload: nodeIds });
    };

    const collapseAll = () => {
        dispatch({ type: "COLLAPSE_ALL" });
    };

    return (
        <MapperContext.Provider
            value={{
                ...state,
                setSource,
                setTarget,
                addMapping,
                removeMapping,
                setMappings,
                toggleExpand,
                expandAll,
                collapseAll,
            }}
        >
            {children}
        </MapperContext.Provider>
    );
}

export function useMapper() {
    const ctx = useContext(MapperContext);
    if (!ctx) {
        throw new Error("useMapper must be used within MapperProvider");
    }
    return ctx;
}
