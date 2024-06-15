import Input from "./input";
import { settings } from "@/lib/store";
import { useStore } from "@nanostores/preact";
import "./settings.css";

export default function Settings() {
  const $settings = useStore(settings);
  return (
    <>
      <Input
        id="server-address"
        type="text"
        label="Server address"
        value={$settings.serverAddress}
        onInput={(e) =>
          settings.setKey(
            "serverAddress",
            (e.target as HTMLInputElement).value || ""
          )
        }
      />
    </>
  );
}
