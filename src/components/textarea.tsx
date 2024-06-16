import type { HTMLAttributes } from "preact/compat";
// import "./textarea.css";

interface Props extends HTMLAttributes<HTMLTextAreaElement> {}

export default function TextArea(props: Props) {
  const { label, ...rest } = props;
  return (
    <div class="textarea">
      <label>{label}</label>
      <textarea {...rest} />
    </div>
  );
}
