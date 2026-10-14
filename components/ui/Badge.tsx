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
        "inline-flex items-center rounded-full border border-brand bg-brand/15 px-3 py-1 text-xs font-medium text-black",
        className,
      )}
    >
      {children}
    </span>
  );
}
