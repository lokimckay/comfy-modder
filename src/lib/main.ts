import type { Run } from "@/components/runs";
import {
  deserializeRuns,
  $bulkEditStr,
  $workflowStr,
  settings,
} from "@/lib/store";
import { ComfyUIClient, type Prompt } from "@/lib/comfyui-client";
import { createId } from "@paralleldrive/cuid2";
import { $logEntries, logger } from "@/lib/logger";
import { $running, $runs } from "./store/progress";

const CLIENT_ID = createId();

export async function generate() {
  $logEntries.set([]);
  const args = getArgs();
  logger.info("Calling ComfyUI with args: ", JSON.stringify(args));
  const { workflow, serverAddress, runs } = args;
  const client = new ComfyUIClient(serverAddress, CLIENT_ID);
  await client.connect();

  $running.set(true);
  $runs.set(
    runs.map((run) => ({
      id: run.id,
      progress: 0,
      promptId: "",
      running: false,
      nodes: [],
    }))
  );

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

    const nodes = Object.keys(replacedWorkflow).map((id) => ({
      id,
      progress: 0,
    }));

    const onStart = (promptId: string) => {
      logger.info(`Started run: ${runId}`);
      $runs.set(
        $runs
          .get()
          .map((run) =>
            run.id === runId ? { ...run, promptId, running: true, nodes } : run
          )
      );
    };

    const onProgress = (
      _promptId: string,
      nodeId: string,
      progress: number
    ) => {
      logger.debug(`Run progressed - node: ${nodeId}: ${progress}`);
      $runs.set(
        $runs.get().map((run) => {
          const _nodes = run.nodes.length === 0 ? nodes : run.nodes;
          return run.id === runId
            ? {
                ...run,
                running: true,
                nodes: _nodes.map((node) =>
                  node.id === nodeId ? { ...node, progress } : node
                ),
                progress:
                  _nodes.length === 0
                    ? 0
                    : _nodes.reduce((acc, node) => acc + node.progress, 0) /
                      _nodes.length,
              }
            : run;
        })
      );
    };

    const onComplete = (_promptId: string) => {
      logger.info(`Run complete: ${runId}`);
      $runs.set(
        $runs
          .get()
          .map((run) =>
            run.id === runId ? { ...run, running: false, progress: 1 } : run
          )
      );
    };

    logger.info("Generating...");
    const images = await client.getImages(replacedWorkflow, {
      onStart,
      onProgress,
      onComplete,
    });

    for (const entry of Object.entries(images)) {
      const [_id, containers] = entry;
      for (const container of containers) {
        if (!container.blob) continue;
        if (container.image.type !== "output") continue;
        const block = document.querySelector(`[data-id="${runId}"]`);
        if (!block) {
          logger.error(`Block ${runId} not found`);
          continue;
        }
        const outputsArea = document.querySelector(
          `[data-id="${runId}"] .outputs`
        );

        const foundUl = outputsArea?.querySelector("ul");
        const ul = foundUl || document.createElement("ul");
        const li = document.createElement("li");
        const img = document.createElement("img");
        const a = document.createElement("a");
        const url = URL.createObjectURL(container.blob);
        a.href = url;
        a.target = "_blank";
        img.src = URL.createObjectURL(container.blob);
        a.appendChild(img);
        li.appendChild(a);
        ul.appendChild(li);
        if (outputsArea && !foundUl) outputsArea.appendChild(ul);
      }
    }
    logger.debug(`Appended images from run: ${runId}`);
  }
  await client.disconnect();
  $running.set(false);
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
