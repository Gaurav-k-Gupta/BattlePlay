import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "danger";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-violet-600 text-white hover:bg-violet-500 focus-visible:outline-violet-400",
  secondary: "border border-line bg-elevated text-white hover:border-violet-500 hover:bg-violet-700/20 focus-visible:outline-violet-400",
  danger: "bg-ember-600 text-white hover:bg-ember-500 focus-visible:outline-ember-400",
};

export function buttonClassName(variant: ButtonVariant = "primary") {
  return cn(
    "inline-flex min-h-11 items-center justify-center rounded-xl px-4 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
    variantClasses[variant],
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant };

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return <button className={cn(buttonClassName(variant), className)} {...props} />;
}
