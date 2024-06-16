import type { HTMLAttributes } from "preact/compat";

type SelectorOption = {
  value: string;
  label: string;
};

interface Props extends HTMLAttributes<HTMLDataListElement> {
  id: string;
  options: SelectorOption[];
  onChange: (e: Event) => void;
}

export default function Selector(props: Props) {
  const { id, options, label, onChange, value, ...rest } = props;

  return (
    <div class="selector">
      <label for={id}>{label}</label>
      <input type="text" list={id} value={value} onChange={onChange} />

      <datalist id={id} {...rest}>
        {options.map(({ value, label: optionLabel }) => (
          <option value={value}>{optionLabel}</option>
        ))}
      </datalist>
    </div>
  );
}
