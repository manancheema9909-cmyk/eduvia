import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

function Select(props) {
  return <SelectPrimitive.Root {...props} />;
}

function SelectTrigger({ className, children, ...props }) {
  return (
    <SelectPrimitive.Trigger
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-[var(--radius-card)] border border-border-paper bg-paper px-3 py-2 font-body text-sm text-ink outline-none focus-visible:border-brass focus-visible:ring-2 focus-visible:ring-brass-light/30 disabled:cursor-not-allowed disabled:opacity-50 [&[data-placeholder]>span]:text-ink/40",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown className="size-4 text-ink/50" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

function SelectContent({ className, children, position = "popper", ...props }) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        position={position}
        className={cn(
          "relative z-50 max-h-60 min-w-[8rem] overflow-hidden rounded-[var(--radius-card)] border border-border-paper bg-paper shadow-md",
          position === "popper" && "translate-y-1",
          className
        )}
        {...props}
      >
        <SelectPrimitive.Viewport className="p-1">
          {children}
        </SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

function SelectItem({ className, children, ...props }) {
  return (
    <SelectPrimitive.Item
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-[calc(var(--radius-card)-2px)] py-1.5 pl-8 pr-2 font-body text-sm text-ink outline-none data-[highlighted]:bg-paper-dim",
        className
      )}
      {...props}
    >
      <span className="absolute left-2 flex size-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check className="size-3.5 text-brass" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

function SelectValue(props) {
  return <SelectPrimitive.Value {...props} />;
}

export { Select, SelectTrigger, SelectContent, SelectItem, SelectValue };
