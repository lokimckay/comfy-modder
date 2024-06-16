import { atom, computed, map } from "nanostores";
import type { SelectorOption } from "@/components/selector";
import type { NodeInfo } from "../comfyui-client";
import type { Node } from "@/components/workflow";
import type { Run } from "@/components/runs";
import { createId } from "@paralleldrive/cuid2";

export const DEFAULT_SERVER_ADDRESS = "127.0.0.1:8188";

export const $workflowStr = atom<string>("");
export const $bulkEditStr = atom<string>("");
export const $runs = atom<Run[]>([]);
export const settings = map({
  serverAddress: DEFAULT_SERVER_ADDRESS,
});

export function setWorkflowStr(str: string) {
  $workflowStr.set(str);
  localStorage.setItem("workflow", str);
}

export function setBulkEdit(newStr: string) {
  $bulkEditStr.set(newStr);
  localStorage.setItem("bulkEdit", newStr);
}

export function setRuns(runs: Run[]) {
  $runs.set(runs);
}

export const $nodes = computed($workflowStr, (wf) => parseWorkflow(wf));
export const $nodeOptions = computed($nodes, (nodes) =>
  nodes.map(({ id, title }) => ({ value: id, label: `#${id} ${title}` }))
);

function parseWorkflow(workflow: string): Node[] {
  const allowedTypes = ["string", "number", "boolean"];
  const raw = JSON.parse(workflow);
  return Object.entries(raw)
    .map((entry) => {
      const [id, info] = entry as [string, NodeInfo];
      const { inputs: rawInputs, class_type, _meta } = info;
      const title = _meta?.title || "";
      const inputs = Object.entries(rawInputs).reduce((acc, [key, value]) => {
        if (allowedTypes.includes(typeof value)) acc[key] = value;
        return acc;
      }, {} as Record<string, string>);
      return { id, title, class_type, inputs };
    })
    .filter((node) => Object.values(node.inputs).length > 0);
}

export function getInputOptions(nodeId: string) {
  const inputOptions = Object.entries(
    $nodes.get().find((node) => node.id === nodeId)?.inputs || {}
  ).map(([key, _]) => ({ value: key, label: key }));
  return inputOptions;
}

export function getDefaultValue(nodeId: string, input: string) {
  const nodeInWorkflow = $nodes.get().find((node) => node.id === nodeId);
  const wfInput = nodeInWorkflow?.inputs[input];
  return typeof wfInput === "string"
    ? wfInput || ""
    : typeof wfInput?.toString === "function"
    ? wfInput.toString()
    : "";
}

export function serializeRuns(runs: Run[]): string {
  let str = "";
  const enc = encodeURIComponent;
  for (const { id, replacements } of runs) {
    if (replacements.length === 0) continue;
    str += `---${id}\n`;
    for (const { nodeId, input, value } of replacements) {
      if (nodeId) str += `${nodeId},${input},${enc(value)}\n`;
    }
  }
  return str;
}

export function deserializeRuns(str: string): Run[] {
  const runs = str.split(/(---.*)(:?\r\n|\r|\n)/g).reduce((acc, idOrBody) => {
    const isRunId = idOrBody.startsWith("---");
    if (isRunId)
      return [...acc, { id: idOrBody.replace("---", ""), replacements: [] }];

    const lastEntry = acc[acc.length - 1];
    const lines = idOrBody.split("\n").filter(Boolean);
    if (lines.length === 0) return acc;
    const replacements = lines.map((line) => {
      const [nodeId = "", input = "", value = ""] = line.split(",");
      const valueType = typeof $nodes.get().find((node) => node.id === nodeId)
        ?.inputs[input];
      const replacement = {
        id: createId(),
        nodeId,
        input,
        value: decodeURIComponent(value).replace(/^\s+|\s+$/g, ""),
        valueType,
      };
      return replacement;
    });
    if (lastEntry) lastEntry.replacements = replacements;
    return acc;
  }, [] as Run[]);
  return runs;
}
