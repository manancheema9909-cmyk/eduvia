import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-card)] font-body text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:size-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass-light",
  {
    variants: {
      variant: {
        default: "bg-ink text-paper hover:bg-ink/90",
        brass: "bg-brass text-paper hover:bg-brass-light",
        outline:
          "border border-border-paper bg-transparent text-ink hover:bg-paper-dim",
        ghost: "text-ink hover:bg-paper-dim",
        destructive: "bg-stamp-red text-paper hover:bg-stamp-red-light",
        link: "text-brass underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-11 px-6",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({ className, variant, size, asChild = false, ...props }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
