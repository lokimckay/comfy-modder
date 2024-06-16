import {
  serializeRuns,
  deserializeRuns,
  $bulkEditStr,
  setBulkEdit,
  setRuns,
} from "@/lib/store";
import { useEffect } from "preact/hooks";
import { useStore } from "@nanostores/preact";
import { createId } from "@paralleldrive/cuid2";
import Replacements from "./replacements";
import { $runs } from "@/lib/store";
import { $running, $runsProgress } from "@/lib/store/progress";
import "./runs.css";

export type Replacement = {
  id: string;
  nodeId: string;
  input: string;
  value: string;
};

export type Run = {
  id: string;
  replacements: Replacement[];
};

export default function Runs() {
  const runs = useStore($runs);
  const count = runs.length > 0 ? ` (${runs.length})` : "";
  const bulkEdit = useStore($bulkEditStr);
  const running = useStore($running);
  const runProgress = useStore($runsProgress);

  useEffect(() => {
    const saved = localStorage.getItem("bulkEdit");
    if (saved) {
      $bulkEditStr.set(saved);
      $runs.set(deserializeRuns(saved));
    }
  }, []);

  function onBulkEditInput(evt: Event) {
    const newStr = (evt.target as HTMLTextAreaElement).value;
    setBulkEdit(newStr);
    const newRuns = deserializeRuns(newStr);
    $runs.set(newRuns);
  }

  return (
    <div class="runs" data-running={running}>
      <h2>Runs{count}</h2>
      <button onClick={() => addRun(defaultRun())}>➕</button>

      <p>Add runs or paste into the bulk edit area</p>

      <ul>
        {runs.map(({ id: runId, replacements }, idx) => {
          const runProgData = runProgress.find((r) => r.id === runId);
          const { progress, running: runGoing } = runProgData || {};
          const runProg = (progress || 0) * 100;
          return (
            <li data-id={runId} data-running={runGoing}>
              <h3>Run #{idx + 1}</h3>
              <Replacements
                replacements={replacements}
                add={(id) => addReplacement(runId, id)}
                update={(id, data) => updateReplacement(runId, id, data)}
                remove={(id) => removeReplacement(runId, id)}
              />
              <div class="outputs">
                <div
                  class="progress-bar"
                  data-visible={running && runProg !== 100}
                  data-ease={runGoing}
                  style={`--progress: ${runProg}%`}
                >
                  <span class="progress-bar-fill">{Math.round(runProg)}%</span>
                </div>
              </div>
              <button class="close" onClick={() => removeRun(runId)}>
                ❌
              </button>
            </li>
          );
        })}
      </ul>

      <h3>Bulk edit</h3>
      <textarea id="bulkedit" rows={5} onInput={onBulkEditInput}>
        {bulkEdit}
      </textarea>

      <button id="submit">Generate</button>
    </div>
  );
}

// State
const defaultRun = () => ({
  id: createId(),
  replacements: [{ id: createId(), nodeId: "", input: "", value: "" }],
});

function addRun(image: Run) {
  setRBE([...$runs.get(), image]);
}

function removeRun(id: string) {
  setRBE($runs.get().filter((image) => id !== image.id));
}

function getRunById(id: string) {
  return $runs.get().find((image) => id === image.id);
}

function addReplacement(runId: string, replacement: Replacement) {
  const changed = getRunById(runId);
  if (!changed) return console.error(`Run with id ${runId} not found`);
  changed.replacements = [...changed.replacements, replacement];
  setRBE([...$runs.get().map((r) => (r.id === runId ? changed : r))]);
}

function updateReplacement(runId: string, id: string, data: any) {
  const changedRun = getRunById(runId);
  if (!changedRun) return console.error(`Run with id ${runId} not found`);
  const changedRepl = changedRun.replacements.find((r) => r.id === id);
  if (!changedRepl) return console.error(`Replacement with id ${id} not found`);
  Object.assign(changedRepl, data);
  setRBE([...$runs.get().map((r) => (r.id === runId ? changedRun : r))]);
}

function removeReplacement(runId: string, replacementId: string) {
  const changed = getRunById(runId);
  if (!changed) return console.error(`Run with id ${runId} not found`);
  changed.replacements = changed.replacements.filter(
    (r) => replacementId !== r.id
  );
  setRBE([...$runs.get().map((r) => (r.id === runId ? changed : r))]);
}

// Set both runs and bulk edit
function setRBE(runs: Run[]) {
  setRuns(runs);
  setBulkEdit(serializeRuns(runs));
}
