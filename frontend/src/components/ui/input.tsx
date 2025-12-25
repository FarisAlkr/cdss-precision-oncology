import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Base styles
          "flex w-full rounded-xl border bg-white/90 px-4 py-3 text-sm font-medium text-slate-700",
          "transition-all duration-300 ease-out",
          // Border and shadow
          "border-slate-200/80",
          "shadow-[0_1px_2px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.8)]",
          // Placeholder
          "placeholder:text-slate-400 placeholder:font-normal",
          // Hover state
          "hover:border-slate-300 hover:bg-white",
          "hover:shadow-[0_2px_4px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,0.9)]",
          // Focus state
          "focus:outline-none focus:border-indigo-500 focus:bg-white",
          "focus:shadow-[0_0_0_4px_rgba(99,102,241,0.1),0_4px_12px_rgba(99,102,241,0.08),inset_0_1px_0_rgba(255,255,255,1)]",
          "focus:ring-0",
          // Disabled state
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50",
          // Number input spinners (hide on webkit)
          "[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
