import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-10 w-full rounded-[var(--radius-card)] border border-border-paper bg-paper px-3 py-2 font-body text-sm text-ink placeholder:text-ink/40 transition-colors outline-none focus-visible:border-brass focus-visible:ring-2 focus-visible:ring-brass-light/30 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export { Input };
