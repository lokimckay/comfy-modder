import { atom, map } from "nanostores";
import type { SelectorOption } from "@/components/selector";
import type { Node } from "@/components/workflow";
import type { Run } from "@/components/runs";
import { createId } from "@paralleldrive/cuid2";

export const DEFAULT_SERVER_ADDRESS = "127.0.0.1:8188";

export const $nodes = atom<Node[]>([]);
export const $nodeOptions = atom<SelectorOption[]>([]);
export const $workflowStr = atom<string>("");
export const $bulkEditStr = atom<string>("");
export const settings = map({
  serverAddress: DEFAULT_SERVER_ADDRESS,
});

export function setNodes(nodes: Node[]) {
  const filtered = nodes.filter(
    (node) => Object.values(node.inputs).length > 0
  );
  $nodes.set(filtered);
  $nodeOptions.set(
    filtered.map(({ id, title }) => ({ value: id, label: `#${id} ${title}` }))
  );
}

export function getInputOptions(nodeId: string) {
  const inputOptions = Object.entries(
    $nodes.get().find((node) => node.id === nodeId)?.inputs || {}
  ).map(([key, _]) => ({ value: key, label: key }));
  return inputOptions;
}

export function getDefaultValue(nodeId: string, input: string) {
  return $nodes.get().find((node) => node.id === nodeId)?.inputs[input] || "";
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
  const runs = str.split(/(---.*)\n/g).reduce((acc, idOrBody) => {
    const isRunId = idOrBody.startsWith("---");
    if (isRunId)
      return [...acc, { id: idOrBody.replace("---", ""), replacements: [] }];

    const lastEntry = acc[acc.length - 1];
    const lines = idOrBody.split("\n").filter(Boolean);
    if (lines.length === 0) return acc;
    const replacements = lines.map((line) => {
      const [nodeId = "", input = "", value = ""] = line.split(",");
      const replacement = {
        id: createId(),
        nodeId,
        input,
        value: decodeURIComponent(value),
      };
      return replacement;
    });
    lastEntry.replacements = replacements;
    return acc;
  }, [] as Run[]);
  return runs;
}
