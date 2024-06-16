import { $nodeOptions, getInputOptions, getDefaultValue } from "@/lib/store";
import { createId } from "@paralleldrive/cuid2";
import type { Replacement } from "./runs";
import Selector from "./selector";
import TextArea from "./textarea";
import "./replacements.css";
import Input from "./input";

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
        {replacements.map(({ id, nodeId, input, value, valueType }) => {
          const valueFieldProps = {
            id: `${id}-value`,
            type: "text",
            label: "Replace with",
            value,
            onInput: (e: Event) =>
              update(id, {
                value: (e.target as HTMLTextAreaElement).value || "",
              }),
          };
          return (
            <li class={valueType}>
              <div class="header">
                <Selector
                  id={`${id}-node`}
                  label="Node ID"
                  value={nodeId}
                  onChange={(e) => {
                    const t = e.target as HTMLSelectElement;
                    const newNodeId = t.value;
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
                  id={`${id}-input`}
                  label="Input"
                  value={input}
                  onChange={(e) => {
                    const newInput =
                      (e.target as HTMLSelectElement).value || "";
                    update(id, { input: newInput });
                    if (value === "")
                      update(id, { value: getDefaultValue(nodeId, newInput) });
                  }}
                  options={getInputOptions(nodeId)}
                />
                <button class="delete" onClick={() => remove(id)}>
                  ❌
                </button>
              </div>
              <div class="body">
                {valueType === "number" ? (
                  <Input {...valueFieldProps} />
                ) : (
                  <TextArea {...valueFieldProps} />
                )}
              </div>
            </li>
          );
        })}
      </ul>
      <button class="add" onClick={() => add(defaultReplacement())}>
        ➕
      </button>
    </>
  );
}

export const defaultReplacement = () => ({
  id: createId(),
  title: "",
  nodeId: "",
  input: "",
  value: "",
  valueType: "string",
});
