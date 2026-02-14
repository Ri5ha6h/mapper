import type { Mapping } from "./types";

function pathToAccess(path: string, inputVar: string): string {
    const parts = path.replace(/^root\./, "").split(".");
    let access = inputVar;
    for (const part of parts) {
        if (/^\d+$/.test(part)) {
            access += `[${part}]`;
        } else {
            access += `.${part}`;
        }
    }
    return access;
}

function generateMappingCode(
    mappings: Mapping[],
    inputVar: string,
    resultVar: string,
    getValue: (sourceAccess: string) => string,
    setValue: (targetAccess: string, value: string) => string,
    declareObject: (path: string) => string
): string {
    const lines: string[] = [];
    const processedTargets = new Set<string>();

    for (const mapping of mappings) {
        const sourceAccess = pathToAccess(mapping.sourceId, inputVar);
        const targetPath = mapping.targetId.replace(/^root\./, "");
        const targetAccess = pathToAccess(mapping.targetId, resultVar);

        const targetParts = targetPath.split(".");
        let currentPath = "";
        for (let i = 0; i < targetParts.length - 1; i++) {
            currentPath += (currentPath ? "." : "") + targetParts[i];
            if (!processedTargets.has(currentPath)) {
                lines.push(declareObject(currentPath));
                processedTargets.add(currentPath);
            }
        }

        lines.push(setValue(targetAccess, getValue(sourceAccess)));
    }

    return lines.join("\n");
}

export function generateJavaScriptCode(mappings: Mapping[]): string {
    const code = generateMappingCode(
        mappings,
        "input",
        "result",
        (src) => `${src}`,
        (tgt, val) => `${tgt} = ${val};`,
        (path) => `result.${path} = {};`
    );
    return `const input = require('./input.json');
const result = {};

${code}

console.log(JSON.stringify(result, null, 2));`;
}

export function generateTypeScriptCode(mappings: Mapping[]): string {
    const code = generateMappingCode(
        mappings,
        "input",
        "result",
        (src) => `${src}`,
        (tgt, val) => `${tgt} = ${val};`,
        (path) => `result.${path} = {};`
    );
    return `interface Input {
    [key: string]: unknown;
}

interface Result {
    [key: string]: unknown;
}

const input: Input = require('./input.json');
const result: Result = {};

${code}

console.log(JSON.stringify(result, null, 2));`;
}

export function generateGroovyCode(mappings: Mapping[]): string {
    const code = generateMappingCode(
        mappings,
        "input",
        "result",
        (src) => `${src}`,
        (tgt, val) => `${tgt} = ${val}`,
        (path) => `result.${path} = [:]`
    );
    return `import groovy.json.JsonSlurper

def jsonSlurper = new JsonSlurper()
def input = jsonSlurper.parse(new File('input.json'))
def result = [:]

${code}

println result.toString()`.trim();
}

export function generateJavaCode(mappings: Mapping[]): string {
    const lines: string[] = [];
    const processedTargets = new Set<string>();

    for (const mapping of mappings) {
        const targetPath = mapping.targetId.replace(/^root\./, "");
        const sourcePath = mapping.sourceId.replace(/^root\./, "");
        const targetParts = targetPath.split(".");
        
        let currentPath = "";
        for (let i = 0; i < targetParts.length - 1; i++) {
            currentPath += (currentPath ? "." : "") + targetParts[i];
            if (!processedTargets.has(currentPath)) {
                const pathArray = currentPath.split(".").map(p => '"' + p + '"').join(", ");
                lines.push(`createNestedMap(result, new String[] { ${pathArray} });`);
                processedTargets.add(currentPath);
            }
        }
        
        const srcArray = sourcePath.split(".").map(p => '"' + p + '"').join(", ");
        const tgtArray = targetPath.split(".").map(p => '"' + p + '"').join(", ");
        lines.push(`setValue(result, new String[] { ${tgtArray} }, getValue(input, new String[] { ${srcArray} }));`);
    }

    const code = lines.join("\n");

    return `import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.File;
import java.util.*;

public class Mapper {
    public static void main(String[] args) throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        Map<String, Object> input = mapper.readValue(new File("input.json"), Map.class);
        Map<String, Object> result = new LinkedHashMap<>();

${code.split("\n").map((l) => "        " + l).join("\n")}

        System.out.println(mapper.writeValueAsString(result));
    }

    private static Object getValue(Map<String, Object> map, String[] keys) {
        Object current = map;
        for (String key : keys) {
            if (current instanceof Map) {
                current = ((Map<String, Object>) current).get(key);
            } else if (current instanceof List) {
                current = ((List<?>) current).get(Integer.parseInt(key));
            }
        }
        return current;
    }

    private static void setValue(Map<String, Object> result, String[] keys, Object value) {
        Map<String, Object> current = result;
        for (int i = 0; i < keys.length - 1; i++) {
            if (!current.containsKey(keys[i])) {
                current.put(keys[i], new LinkedHashMap<>());
            }
            current = (Map<String, Object>) current.get(keys[i]);
        }
        current.put(keys[keys.length - 1], value);
    }

    private static void createNestedMap(Map<String, Object> result, String[] keys) {
        Map<String, Object> current = result;
        for (String key : keys) {
            if (!current.containsKey(key)) {
                current.put(key, new LinkedHashMap<>());
            }
            current = (Map<String, Object>) current.get(key);
        }
    }
}`;
}

export function generatePythonCode(mappings: Mapping[]): string {
    const lines: string[] = [];
    const processedTargets = new Set<string>();

    for (const mapping of mappings) {
        const targetPath = mapping.targetId.replace(/^root\./, "");
        const sourcePath = mapping.sourceId.replace(/^root\./, "");
        const targetParts = targetPath.split(".");
        
        let currentPath = "";
        for (let i = 0; i < targetParts.length - 1; i++) {
            currentPath += (currentPath ? "." : "") + targetParts[i];
            if (!processedTargets.has(currentPath)) {
                const keys = currentPath.split(".").map(p => "'" + p + "'").join(", ");
                lines.push(`set_nested_value(result, ${keys}, {})`);
                processedTargets.add(currentPath);
            }
        }
        
        const srcKeys = sourcePath.split(".").map(p => "'" + p + "'").join(", ");
        const tgtKeys = targetPath.split(".").map(p => "'" + p + "'").join(", ");
        lines.push(`set_nested_value(result, ${tgtKeys}, get_nested_value(input, ${srcKeys}))`);
    }

    const code = lines.join("\n");

    return `import json
from functools import reduce
from typing import Any

def get_nested_value(data: dict, *keys) -> Any:
    return reduce(lambda d, key: d.get(key) if isinstance(d, dict) else d[int(key)] if d else None, keys, data)

def set_nested_value(data: dict, *keys, value):
    current = data
    for key in keys[:-1]:
        if key not in current:
            current[key] = {}
        current = current[key]
    current[keys[-1]] = value

with open('input.json', 'r') as f:
    input_data = json.load(f)

result = {}

${code.split("\n").map((l) => "    " + l).join("\n")}

print(json.dumps(result, indent=2))`;
}

export function generateCSharpCode(mappings: Mapping[]): string {
    const lines: string[] = [];
    const processedTargets = new Set<string>();

    for (const mapping of mappings) {
        const targetPath = mapping.targetId.replace(/^root\./, "");
        const sourcePath = mapping.sourceId.replace(/^root\./, "");
        
        let currentPath = "";
        const targetParts = targetPath.split(".");
        for (let i = 0; i < targetParts.length - 1; i++) {
            currentPath += (currentPath ? "." : "") + targetParts[i];
            if (!processedTargets.has(currentPath)) {
                lines.push(`SetValue(result, "${currentPath}", new Dictionary<string, object>());`);
                processedTargets.add(currentPath);
            }
        }
        
        lines.push(`SetValue(result, "${targetPath}", GetValue(input, "${sourcePath}"));`);
    }

    const code = lines.join("\n");

    return `using System;
using System.Collections.Generic;
using System.IO;
using System.Text.Json;

public class Mapper
{
    public static void Main()
    {
        string json = File.ReadAllText("input.json");
        var input = JsonSerializer.Deserialize<Dictionary<string, object>>(json);
        var result = new Dictionary<string, object>();

${code.split("\n").map((l) => "        " + l).join("\n")}

        Console.WriteLine(JsonSerializer.Serialize(result, new JsonSerializerOptions { WriteIndented = true }));
    }

    private static object GetValue(Dictionary<string, object> dict, string path)
    {
        var parts = path.Split('.');
        object current = dict;
        foreach (var part in parts)
        {
            if (current is Dictionary<string, object> d)
            {
                current = d.GetValueOrDefault(part);
            }
            else if (current is List<object> l && int.TryParse(part, out int index))
            {
                current = l[index];
            }
        }
        return current;
    }

    private static void SetValue(Dictionary<string, object> result, string path, object value)
    {
        var parts = path.Split('.');
        var current = result;
        for (int i = 0; i < parts.Length - 1; i++)
        {
            if (!current.ContainsKey(parts[i]))
            {
                current[parts[i]] = new Dictionary<string, object>();
            }
            current = (Dictionary<string, object>)current[parts[i]];
        }
        current[parts[^1]] = value;
    }
}`;
}

export function generateCode(mappings: Mapping[], language: string): string {
    switch (language) {
        case "javascript":
            return generateJavaScriptCode(mappings);
        case "typescript":
            return generateTypeScriptCode(mappings);
        case "groovy":
            return generateGroovyCode(mappings);
        case "java":
            return generateJavaCode(mappings);
        case "python":
            return generatePythonCode(mappings);
        case "csharp":
            return generateCSharpCode(mappings);
        default:
            return generateGroovyCode(mappings);
    }
}
