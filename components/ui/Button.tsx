import { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

type ButtonVariant = "primary" | "secondary" | "outline";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variantClassMap: Record<ButtonVariant, string> = {
  primary:
    "bg-gold text-black border border-gold hover:bg-gold/90 focus-visible:ring-gold",
  secondary:
    "bg-black text-white border border-black hover:bg-zinc-900 focus-visible:ring-zinc-700",
  outline:
    "bg-transparent text-black border border-zinc-300 hover:border-gold hover:text-gold focus-visible:ring-gold",
};

export function Button({
  className,
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center rounded-sm px-5 py-3 text-sm font-semibold tracking-wide transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        variantClassMap[variant],
        className,
      )}
      type={type}
      {...props}
    />
  );
}
