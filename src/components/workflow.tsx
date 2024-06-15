import { signal, effect } from "@preact/signals";
import type { Signal } from "@preact/signals";
import type { NodeInfo } from "@/lib/comfyui-client";
import { useEffect } from "preact/hooks";
import { $workflowStr, setNodes } from "@/lib/store";
import "./workflow.css";

export interface Node extends NodeInfo {
  id: string;
  title: string;
}

const workflow: Signal<string> = signal("");
effect(() => {
  $workflowStr.set(workflow.value);
  const nodes = workflow.value ? parseWorkflow(workflow.value) : [];
  setNodes(nodes);
});

export default function Workflow() {
  useEffect(() => {
    const saved = localStorage.getItem("workflow");
    if (saved) workflow.value = saved;

    effect(() => {
      localStorage.setItem("workflow", workflow.value);
    });
  }, []);

  return (
    <>
      <h2>Workflow</h2>
      <p>Paste workflow_api.json</p>
      <textarea
        id="workflow"
        rows={10}
        spellCheck={false}
        placeholder="Paste workflow_api.json here"
        onInput={(e) =>
          (workflow.value = (e.target as HTMLTextAreaElement).value)
        }
        value={workflow}
      />
    </>
  );
}

// State
function parseWorkflow(workflow: string): Node[] {
  const raw = JSON.parse(workflow);
  return Object.entries(raw).map((entry) => {
    const [id, info] = entry as [string, NodeInfo];
    const { inputs: rawInputs, class_type, _meta } = info;
    const title = _meta?.title || "";
    const inputs = Object.entries(rawInputs).reduce((acc, [key, value]) => {
      if (typeof value === "string") acc[key] = value;
      return acc;
    }, {} as Record<string, string>);
    return { id, title, class_type, inputs };
  });
}
