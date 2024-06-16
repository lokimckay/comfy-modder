import sampleJson from "@/examples/time_of_day_api.json";
import sampleConfig from "@/examples/time_of_day_config.txt?raw";
import { generate } from "@/lib/main";
import {
  deserializeRuns,
  setBulkEdit,
  setRuns,
  setWorkflowStr,
} from "@/lib/store";

export default function Demo() {
  function populateFields() {
    setWorkflowStr(JSON.stringify(sampleJson, null, 2));
    setBulkEdit(sampleConfig);
    setRuns(deserializeRuns(sampleConfig));
    generate();
  }

  return (
    <>
      <button id="demo" onClick={populateFields}>
        Show me
      </button>
    </>
  );
}
