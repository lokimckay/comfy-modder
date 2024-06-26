import { useStore } from "@nanostores/preact";
import { $logs } from "@/lib/logger";
import "./terminal.css";

export default function Terminal() {
  const logs = useStore($logs);
  return (
    <>
      <h2>Logs</h2>
      <textarea
        id="terminal"
        rows={20}
        value={logs.join("\n")}
        readOnly={true}
      />
    </>
  );
}
