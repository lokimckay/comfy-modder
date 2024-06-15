import { useStore } from "@nanostores/preact";
import { $logs } from "@/lib/logger";
import "./terminal.css";

export default function Terminal() {
  const logs = useStore($logs);
  const emptyClass = logs.length <= 0 ? "empty" : undefined;
  return (
    <>
      <h2 class={emptyClass}>Logs</h2>
      <textarea class={emptyClass} id="terminal" rows={10} readOnly={true}>
        {logs.join("\n")}
      </textarea>
    </>
  );
}
