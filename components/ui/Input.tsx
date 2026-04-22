import { forwardRef, InputHTMLAttributes } from "react";
import clsx from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, id, label, ...props }, ref) => (
    <label className="grid gap-2 text-sm text-zinc-700" htmlFor={id}>
      <span className="font-medium">{label}</span>
      <input
        ref={ref}
        className={clsx(
          "h-11 rounded-sm border border-zinc-300 bg-white px-3 text-sm text-black outline-none transition-colors placeholder:text-zinc-400 focus:border-brand",
          className,
        )}
        id={id}
        {...props}
      />
    </label>
  ),
);

Input.displayName = "Input";
