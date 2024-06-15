import type { Run } from "@/components/runs";
import { deserializeRuns, $bulkEditStr } from "@/lib/store.ts";
import { ComfyUIClient, type Prompt } from "@/lib/comfyui-client";
import { createId } from "@paralleldrive/cuid2";
import { $workflowStr, settings } from "@/lib/store.ts";
import { $logEntries, logger } from "@/lib/logger";

const CLIENT_ID = createId();

export async function generate() {
  $logEntries.set([]);
  const args = getArgs();
  logger.info("Calling ComfyUI with args: ", args);
  const { workflow, serverAddress, runs } = args;
  const client = new ComfyUIClient(serverAddress, CLIENT_ID);
  await client.connect();

  for (const run of runs) {
    const { id: runId, replacements } = run;
    const replacedWorkflow = structuredClone(workflow);
    for (const { nodeId, input, value } of replacements) {
      if (!nodeId || !input || !value) continue;
      logger.info(`Replacing #${nodeId}.${input} with '${value}'`);
      try {
        replacedWorkflow[nodeId].inputs[input] = value;
      } catch (e) {
        console.error(
          `Failed to replace ${nodeId}.${input} with '${value}'`,
          e
        );
      }
    }

    logger.info("Generating...");
    const images = await client.getImages(replacedWorkflow);

    for (const entry of Object.entries(images)) {
      const [id, containers] = entry;
      for (const container of containers) {
        if (!container.blob) continue;
        if (container.image.type !== "output") continue;
        const block = document.querySelector(`[data-id="${runId}"]`);
        if (!block) {
          logger.error(`Block ${runId} not found`);
          continue;
        }
        const foundUl = document.querySelector(`[data-id="${runId}"] .outputs`);
        const ul = foundUl || document.createElement("ul");
        ul.classList.add("outputs");
        const li = document.createElement("li");
        const img = document.createElement("img");
        const a = document.createElement("a");
        const url = URL.createObjectURL(container.blob);
        a.href = url;
        // a.download = `${runId}-${id}.png`;
        a.target = "_blank";
        img.src = URL.createObjectURL(container.blob);
        a.appendChild(img);
        li.appendChild(a);
        ul.appendChild(li);
        if (!foundUl) block.appendChild(ul);
      }
    }
    logger.info(`Finished run ${runId}`);
  }
  await client.disconnect();
}

function getArgs(): {
  workflow: Prompt;
  serverAddress: string;
  runs: Run[];
} {
  return {
    runs: deserializeRuns($bulkEditStr.get()),
    workflow: JSON.parse($workflowStr.get() || "{}") as Prompt,
    serverAddress: settings.get().serverAddress,
  };
}
