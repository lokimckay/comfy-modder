import { $workflowStr, setWorkflowStr } from "@/lib/store";
import type { NodeInfo } from "@/lib/comfyui-client";
import { useStore } from "@nanostores/preact";
import { useEffect } from "preact/hooks";
import "./workflow.css";

export interface Node extends NodeInfo {
  id: string;
  title: string;
}

export default function Workflow() {
  const workflow = useStore($workflowStr);

  useEffect(() => {
    const saved = localStorage.getItem("workflow") || "";
    if (saved) $workflowStr.set(saved);
  }, []);

  return (
    <>
      <h2>Workflow</h2>
      <p>Paste workflow_api.json</p>
      <textarea
        id="workflow"
        rows={10}
        spellcheck={false}
        placeholder="Paste workflow_api.json here"
        onInput={(e) => setWorkflowStr((e.target as HTMLTextAreaElement).value)}
        value={workflow}
      />
    </>
  );
}
