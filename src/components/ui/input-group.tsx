import * as React from "react";
import { cn } from "@/lib/utils";

function InputGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-group"
      className={cn(
        "relative flex w-full items-center rounded-md border border-slate-200 bg-white shadow-xs",
        "h-9 min-w-0 px-2.5",
        className
      )}
      {...props}
    />
  );
}

function InputGroupAddon({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex items-center justify-center text-slate-400 select-none mr-2",
        className
      )}
      {...props}
    />
  );
}

function InputGroupInput({
  className,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <input
      data-slot="input-group-control"
      className={cn(
        "flex-1 bg-transparent border-0 outline-none text-sm text-slate-800 placeholder:text-slate-400",
        className
      )}
      {...props}
    />
  );
}

export { InputGroup, InputGroupAddon, InputGroupInput };
