import { $nodeOptions, getInputOptions, getDefaultValue } from "@/lib/store";
import { createId } from "@paralleldrive/cuid2";
import type { Replacement } from "./runs";
import Input from "./input";
import Selector from "./selector";
import "./replacements.css";

export default function Replacements({
  replacements,
  add,
  update,
  remove,
}: {
  replacements: Replacement[];
  add: (replacement: Replacement) => void;
  update: (
    id: string,
    replacement: {
      nodeId?: string;
      input?: string;
      value?: string;
    }
  ) => void;
  remove: (id: string) => void;
}) {
  return (
    <>
      <ul class="replacements">
        {replacements.map(({ id, nodeId, input, value }) => (
          <li>
            <Selector
              id="node"
              label="Node"
              value={nodeId}
              onChange={(e) => {
                const newNodeId = (e.target as HTMLSelectElement).value;
                update(id, { nodeId: newNodeId });
                const inputOptions = getInputOptions(newNodeId);
                if (inputOptions.length > 0) {
                  const newInput = inputOptions[0].value || "";
                  update(id, { input: newInput });
                  if (value === "")
                    update(id, {
                      value: getDefaultValue(newNodeId, newInput),
                    });
                }
              }}
              options={$nodeOptions.get()}
            />
            <Selector
              id="input"
              label="Input"
              value={input}
              onChange={(e) => {
                const newInput = (e.target as HTMLSelectElement).value || "";
                update(id, { input: newInput });
                if (value === "")
                  update(id, { value: getDefaultValue(nodeId, newInput) });
              }}
              options={getInputOptions(nodeId)}
            />
            <Input
              type="text"
              label="Replace with"
              value={value}
              onInput={(e) =>
                update(id, {
                  value: (e.target as HTMLInputElement).value || "",
                })
              }
            />
            <button class="delete" onClick={() => remove(id)}>
              ❌
            </button>
          </li>
        ))}
      </ul>
      <button
        onClick={() =>
          add({ id: createId(), nodeId: "", input: "", value: "" })
        }
      >
        ➕
      </button>
    </>
  );
}
