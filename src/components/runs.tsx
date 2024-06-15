import { serializeRuns, deserializeRuns, $bulkEditStr } from "@/lib/store";
import { signal, type Signal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import { useStore } from "@nanostores/preact";
import { createId } from "@paralleldrive/cuid2";
import Replacements from "./replacements";
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

const runs: Signal<Run[]> = signal([]);

export default function Runs() {
  const count = runs.value.length > 0 ? ` (${runs.value.length})` : "";
  const bulkEdit = useStore($bulkEditStr);

  useEffect(() => {
    const saved = localStorage.getItem("bulkEdit");
    if (saved) {
      setBulkEdit(saved);
      setRuns(deserializeRuns(saved));
    }
  }, []);

  function onBulkEditInput(evt: Event) {
    const newStr = (evt.target as HTMLTextAreaElement).value;
    setBulkEdit(newStr);
    const newImgs = deserializeRuns(newStr);
    setRuns([...newImgs]);
  }

  return (
    <div class="runs">
      <h2>Runs{count}</h2>
      <button onClick={() => addRun(defaultRun())}>➕</button>

      <p>Add runs or paste into the bulk edit area</p>

      <ul>
        {runs.value.map(({ id: runId, replacements }, idx) => (
          <li data-id={runId}>
            <h3>Run #{idx + 1}</h3>
            <Replacements
              replacements={replacements}
              add={(id) => addReplacement(runId, id)}
              update={(id, data) => updateReplacement(runId, id, data)}
              remove={(id) => removeReplacement(runId, id)}
            />
            <button class="close" onClick={() => removeRun(runId)}>
              ❌
            </button>
          </li>
        ))}
      </ul>

      <h3>Bulk edit</h3>
      <textarea id="bulkedit" rows={5} onInput={onBulkEditInput}>
        {bulkEdit}
      </textarea>
    </div>
  );
}

// State
function setRuns(newRuns: Run[]) {
  runs.value = newRuns;
  const serialized = serializeRuns(newRuns);
  setBulkEdit(serialized);
}

function setBulkEdit(newStr: string) {
  $bulkEditStr.set(newStr);
  localStorage.setItem("bulkEdit", newStr);
}

const defaultRun = () => ({
  id: createId(),
  replacements: [{ id: createId(), nodeId: "", input: "", value: "" }],
});

function addRun(image: Run) {
  setRuns([...runs.value, image]);
}

function removeRun(id: string) {
  setRuns(runs.value.filter((image) => id !== image.id));
}

function getRunById(id: string) {
  return runs.value.find((image) => id === image.id);
}

function addReplacement(runId: string, replacement: Replacement) {
  const found = getRunById(runId);
  if (!found) return console.error(`Run with id ${runId} not found`);
  found.replacements = [...found.replacements, replacement];
  setRuns([...runs.value]);
}

function updateReplacement(runId: string, id: string, data: any) {
  const foundImg = getRunById(runId);
  if (!foundImg) return console.error(`Run with id ${runId} not found`);
  const foundData = foundImg.replacements.find((r) => r.id === id);
  if (!foundData) return console.error(`Replacement with id ${id} not found`);
  Object.assign(foundData, data);
  setRuns([...runs.value]);
}

function removeReplacement(runId: string, replacementId: string) {
  const found = getRunById(runId);
  if (!found) return console.error(`Run with id ${runId} not found`);
  found.replacements = found.replacements.filter((r) => replacementId !== r.id);
  setRuns([...runs.value]);
}
