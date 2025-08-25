import * as React from "react";
import { cn } from "@/lib/utils";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export function Select({ className, children, ...props }: React.PropsWithChildren<SelectProps>) {
  return (
    <select className={cn("bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm w-full", className)} {...props}>
      {children}
    </select>
  );
}
