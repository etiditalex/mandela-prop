import { ReactNode } from "react";

export function AgentPageHeader({
  title,
  breadcrumb,
  actions,
}: {
  title: string;
  breadcrumb?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h1 className="text-xl font-semibold text-zinc-800">
        {title}
        {breadcrumb ? <span className="ml-2 text-sm font-normal text-zinc-400">» {breadcrumb}</span> : null}
      </h1>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
