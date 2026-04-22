import { ReactNode } from "react";
import clsx from "clsx";

export function Badge({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border border-brand/40 bg-brand/10 px-3 py-1 text-xs font-medium text-brand",
        className,
      )}
    >
      {children}
    </span>
  );
}
