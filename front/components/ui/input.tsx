import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn("bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm w-full", className)}
      {...props}
    />
  );
});
Input.displayName = "Input";
export { Input };
