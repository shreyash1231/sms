import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function Button({ className, ...props }: ButtonProps) {
  return (
    <button
      className={cn("inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-medium bg-white text-black hover:opacity-90 disabled:opacity-50 border border-slate-200", className)}
      {...props}
    />
  );
}
