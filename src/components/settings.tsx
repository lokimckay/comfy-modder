import Enum from "./enum";
import Input from "./input";
import { settings } from "@/lib/store";
import { useStore } from "@nanostores/preact";
import "./settings.css";

export default function Settings() {
  const $settings = useStore(settings);
  const logLevels = [
    { value: "debug", label: "Debug" },
    { value: "info", label: "Info" },
    { value: "warn", label: "Warn" },
    { value: "error", label: "Error" },
  ];

  return (
    <div class="settings">
      <Input
        id="server-address"
        type="text"
        label="Server address"
        value={$settings.serverAddress}
        onInput={(e) =>
          settings.setKey(
            "serverAddress",
            (e.target as HTMLInputElement)?.value || ""
          )
        }
      />
      <Enum
        id="log-level"
        label="Log level"
        options={logLevels}
        value={$settings.logLevel}
        onChange={(e) => {
          const level = (e.target as HTMLSelectElement)?.value || "info";
          settings.setKey("logLevel", level);
        }}
      />
    </div>
  );
}
