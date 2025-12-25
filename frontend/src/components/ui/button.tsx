import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center whitespace-nowrap font-semibold",
    "transition-all duration-300 ease-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    "active:scale-[0.98]",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600",
          "text-white",
          "rounded-xl",
          "shadow-[0_4px_12px_rgba(99,102,241,0.3),inset_0_1px_0_rgba(255,255,255,0.2)]",
          "hover:shadow-[0_8px_24px_rgba(99,102,241,0.4),inset_0_1px_0_rgba(255,255,255,0.2)]",
          "hover:from-indigo-600 hover:via-purple-600 hover:to-indigo-700",
          "hover:-translate-y-0.5",
          "focus-visible:ring-indigo-500",
        ].join(" "),
        destructive: [
          "bg-gradient-to-r from-rose-500 to-red-600",
          "text-white",
          "rounded-xl",
          "shadow-[0_4px_12px_rgba(239,68,68,0.3)]",
          "hover:shadow-[0_8px_24px_rgba(239,68,68,0.4)]",
          "hover:from-rose-600 hover:to-red-700",
          "hover:-translate-y-0.5",
          "focus-visible:ring-rose-500",
        ].join(" "),
        outline: [
          "border-2 border-slate-200",
          "bg-white/80",
          "text-slate-700",
          "rounded-xl",
          "backdrop-blur-sm",
          "shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
          "hover:border-indigo-300 hover:bg-white",
          "hover:text-indigo-600",
          "hover:shadow-[0_4px_12px_rgba(99,102,241,0.1)]",
          "focus-visible:ring-indigo-500",
        ].join(" "),
        secondary: [
          "bg-slate-100",
          "text-slate-700",
          "rounded-xl",
          "hover:bg-slate-200",
          "focus-visible:ring-slate-400",
        ].join(" "),
        ghost: [
          "text-slate-600",
          "rounded-xl",
          "hover:bg-slate-100 hover:text-slate-900",
          "focus-visible:ring-slate-400",
        ].join(" "),
        link: [
          "text-indigo-600",
          "underline-offset-4",
          "hover:underline hover:text-indigo-700",
        ].join(" "),
        premium: [
          "relative overflow-hidden",
          "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500",
          "text-white",
          "rounded-xl",
          "shadow-[0_4px_16px_rgba(99,102,241,0.35),inset_0_1px_0_rgba(255,255,255,0.25)]",
          "hover:shadow-[0_8px_28px_rgba(99,102,241,0.45),inset_0_1px_0_rgba(255,255,255,0.25)]",
          "hover:-translate-y-0.5",
          "focus-visible:ring-purple-500",
          "before:absolute before:inset-0",
          "before:bg-gradient-to-r before:from-purple-600 before:via-pink-500 before:to-indigo-600",
          "before:opacity-0 before:transition-opacity before:duration-300",
          "hover:before:opacity-100",
        ].join(" "),
      },
      size: {
        default: "h-11 px-6 py-2.5 text-sm gap-2",
        sm: "h-9 px-4 py-2 text-xs gap-1.5",
        lg: "h-14 px-8 py-3 text-base gap-2.5",
        xl: "h-16 px-10 py-4 text-lg gap-3",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, children, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {variant === "premium" ? (
          <span className="relative z-10 flex items-center gap-2">{children}</span>
        ) : (
          children
        )}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
