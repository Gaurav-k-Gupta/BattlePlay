import type { HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type BadgeStatus = "upcoming" | "live" | "completed";

const statusStyles: Record<BadgeStatus, string> = {
  upcoming: "border-violet-500/40 bg-violet-700/20 text-violet-400",
  live: "border-ember-500/50 bg-ember-700/20 text-ember-400",
  completed: "border-line bg-elevated text-muted",
};

export function Badge({ className, status, ...props }: HTMLAttributes<HTMLSpanElement> & { status: BadgeStatus }) {
  return (
    <span
      className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold uppercase tracking-[0.12em]", statusStyles[status], className)}
      {...props}
    />
  );
}
