import { JSX } from "solid-js";

export function Button(
  props: Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, "classList"> & {
    outlined?: boolean;
  }
) {
  return (
    <button
      {...props}
      classList={{
        "rounded-[0.256em] p-3 text-white min-w-[164px] font-medium transition-colors shadow shadow-sm":
          true,
        "bg-amber-600 hover:bg-amber-700 active:bg-amber-800": !props.outlined,
        "bg-white border border-amber-600 hover:bg-amber-100 active:bg-amber-200 text-amber-600":
          props.outlined,
      }}
    >
      {props.children}
    </button>
  );
}

export function Input(props: JSX.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      classList={{
        "border border-gray-400 rounded-[0.175em] p-2 shadow-sm": true,
      }}
    />
  );
}

export function FormField(props: {
  class?: string;
  label: string;
  children: JSX.Element;
}) {
  return (
    <label class={props.class}>
      <span class="block font-medium mr-2">{props.label}</span>
      {props.children}
    </label>
  );
}
