import type { HTMLAttributes } from "preact/compat";
import "./input.css";

interface Props extends HTMLAttributes<HTMLInputElement> {}

export default function Input(props: Props) {
  const { label, ...rest } = props;
  return (
    <div class="input">
      <label>{label}</label>
      <input {...rest} />
    </div>
  );
}
