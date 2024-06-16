import type { HTMLAttributes } from "preact/compat";

type EnumOption = {
  value: string;
  label: string;
};

interface Props extends HTMLAttributes<HTMLSelectElement> {
  id: string;
  options: EnumOption[];
}

export default function Enum(props: Props) {
  const { id, options, label, value, ...rest } = props;

  return (
    <div class="enum">
      <label for={id}>{label}</label>
      <select id={id} value={value} {...rest}>
        {options.map(({ value, label: optionLabel }) => (
          <option value={value}>{optionLabel}</option>
        ))}
      </select>
    </div>
  );
}
