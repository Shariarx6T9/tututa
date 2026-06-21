"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

// ── GlassCard ─────────────────────────────────────────────────

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  glow?: boolean;
  as?: "div" | "article" | "section";
}

export function GlassCard({
  children,
  className,
  hover = false,
  glow = false,
  as: Tag = "div",
  ...props
}: GlassCardProps) {
  return (
    <Tag
      className={cn(
        "relative rounded-[var(--radius-lg)] border border-[rgba(255,255,255,0.06)]",
        "bg-[var(--color-surface-1)]",
        "shadow-[var(--shadow-card)]",
        hover && "transition-all duration-200 hover:border-[rgba(255,255,255,0.1)] hover:bg-[var(--color-surface-2)] cursor-pointer",
        glow && "hover:shadow-[var(--shadow-glow-violet)]",
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}

// ── MotionCard ────────────────────────────────────────────────

type MotionCardProps = HTMLMotionProps<"div"> & {
  glow?: boolean;
};

export function MotionCard({ children, className, glow, ...props }: MotionCardProps) {
  return (
    <motion.div
      className={cn(
        "relative rounded-[var(--radius-lg)] border border-[rgba(255,255,255,0.06)]",
        "bg-[var(--color-surface-1)] shadow-[var(--shadow-card)]",
        glow && "hover:shadow-[var(--shadow-glow-violet)] transition-shadow duration-300",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// ── Button ────────────────────────────────────────────────────

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 font-medium transition-all duration-150",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-void)]",
    "disabled:opacity-40 disabled:cursor-not-allowed select-none",
  ],
  {
    variants: {
      variant: {
        primary: [
          "bg-violet-600 text-white border border-violet-500/50",
          "hover:bg-violet-500 active:bg-violet-700",
          "shadow-[0_2px_8px_rgba(124,58,237,0.4)]",
          "hover:shadow-[0_4px_16px_rgba(124,58,237,0.5)]",
        ],
        secondary: [
          "bg-[rgba(255,255,255,0.06)] text-[var(--color-text-primary)] border border-[rgba(255,255,255,0.08)]",
          "hover:bg-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.12)]",
          "active:bg-[rgba(255,255,255,0.05)]",
        ],
        ghost: [
          "bg-transparent text-[var(--color-text-secondary)] border border-transparent",
          "hover:bg-[rgba(255,255,255,0.06)] hover:text-[var(--color-text-primary)]",
        ],
        danger: [
          "bg-rose-600/15 text-rose-400 border border-rose-500/30",
          "hover:bg-rose-600/25 hover:border-rose-500/50",
        ],
        glass: [
          "glass text-[var(--color-text-primary)]",
          "hover:bg-[rgba(255,255,255,0.08)]",
        ],
        violet: [
          "bg-[rgba(124,58,237,0.15)] text-violet-300 border border-[rgba(124,58,237,0.25)]",
          "hover:bg-[rgba(124,58,237,0.25)] hover:border-[rgba(124,58,237,0.4)]",
        ],
      },
      size: {
        xs:  "text-[11px] h-6   px-2.5  rounded-md",
        sm:  "text-[12px] h-7.5 px-3    rounded-lg",
        md:  "text-[13px] h-9   px-4    rounded-lg",
        lg:  "text-[14px] h-10  px-5    rounded-xl",
        xl:  "text-[15px] h-12  px-6    rounded-xl",
        icon: "h-8 w-8 rounded-lg p-0",
        "icon-sm": "h-7 w-7 rounded-md p-0",
        "icon-lg": "h-10 w-10 rounded-xl p-0",
      },
    },
    defaultVariants: {
      variant: "secondary",
      size: "md",
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, leftIcon, rightIcon, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {loading ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        leftIcon
      )}
      {children}
      {rightIcon}
    </button>
  )
);
Button.displayName = "Button";

// ── Badge ─────────────────────────────────────────────────────

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "violet" | "cyan" | "emerald" | "rose" | "amber" | "ghost";
  dot?: boolean;
}

export function Badge({ children, className, variant = "default", dot, ...props }: BadgeProps) {
  const variants = {
    default:  "bg-[rgba(255,255,255,0.08)] text-[var(--color-text-secondary)]",
    violet:   "bg-[rgba(124,58,237,0.2)]  text-violet-300 border border-[rgba(124,58,237,0.3)]",
    cyan:     "bg-[rgba(6,182,212,0.15)]   text-cyan-300   border border-[rgba(6,182,212,0.25)]",
    emerald:  "bg-[rgba(16,185,129,0.15)]  text-emerald-300 border border-[rgba(16,185,129,0.25)]",
    rose:     "bg-[rgba(244,63,94,0.15)]   text-rose-300   border border-[rgba(244,63,94,0.25)]",
    amber:    "bg-[rgba(245,158,11,0.15)]  text-amber-300  border border-[rgba(245,158,11,0.25)]",
    ghost:    "bg-transparent text-[var(--color-text-muted)] border border-[rgba(255,255,255,0.06)]",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md",
        variants[variant],
        className
      )}
      {...props}
    >
      {dot && (
        <span className={cn("w-1.5 h-1.5 rounded-full", {
          "bg-violet-400":  variant === "violet",
          "bg-cyan-400":    variant === "cyan",
          "bg-emerald-400": variant === "emerald",
          "bg-rose-400":    variant === "rose",
          "bg-amber-400":   variant === "amber",
          "bg-[var(--color-text-muted)]": variant === "default" || variant === "ghost",
        })} />
      )}
      {children}
    </span>
  );
}

// ── Input ─────────────────────────────────────────────────────

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: string;
  label?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, leftIcon, rightIcon, error, label, id, ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-[12px] font-medium text-[var(--color-text-secondary)] mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            "w-full bg-[rgba(255,255,255,0.04)] border rounded-lg text-[13px]",
            "text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]",
            "transition-all duration-150 outline-none",
            "focus:bg-[rgba(255,255,255,0.06)] focus:border-[rgba(124,58,237,0.5)]",
            error
              ? "border-rose-500/50 focus:border-rose-500"
              : "border-[rgba(255,255,255,0.08)]",
            leftIcon ? "pl-9" : "pl-3",
            rightIcon ? "pr-9" : "pr-3",
            "py-2 h-9",
            className
          )}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-[11px] text-rose-400">{error}</p>
      )}
    </div>
  )
);
Input.displayName = "Input";

// ── Textarea ──────────────────────────────────────────────────

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  label?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, label, id, ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-[12px] font-medium text-[var(--color-text-secondary)] mb-1.5">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={id}
        className={cn(
          "w-full bg-[rgba(255,255,255,0.04)] border rounded-lg text-[13px]",
          "text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]",
          "transition-all duration-150 outline-none resize-none",
          "focus:bg-[rgba(255,255,255,0.06)] focus:border-[rgba(124,58,237,0.5)]",
          error
            ? "border-rose-500/50 focus:border-rose-500"
            : "border-[rgba(255,255,255,0.08)]",
          "px-3 py-2",
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-[11px] text-rose-400">{error}</p>
      )}
    </div>
  )
);
Textarea.displayName = "Textarea";

// ── Skeleton ──────────────────────────────────────────────────

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("skeleton rounded-lg", className)}
      {...props}
    />
  );
}

// ── PageHeader ────────────────────────────────────────────────

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
}

export function PageHeader({ title, subtitle, icon, actions }: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between px-6 py-4 border-b border-[rgba(255,255,255,0.06)] flex-shrink-0"
    >
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-8 h-8 rounded-lg bg-[rgba(124,58,237,0.15)] border border-[rgba(124,58,237,0.2)] flex items-center justify-center text-violet-400">
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-[15px] font-semibold text-[var(--color-text-primary)] leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[12px] text-[var(--color-text-muted)] mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </motion.div>
  );
}

// ── Divider ───────────────────────────────────────────────────

export function Divider({ className }: { className?: string }) {
  return (
    <div className={cn("h-px bg-[rgba(255,255,255,0.06)]", className)} />
  );
}

// ── EmptyState ────────────────────────────────────────────────

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="w-14 h-14 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] flex items-center justify-center text-[var(--color-text-muted)] mb-4">
        {icon}
      </div>
      <h3 className="text-[14px] font-medium text-[var(--color-text-secondary)] mb-1.5">
        {title}
      </h3>
      {description && (
        <p className="text-[12px] text-[var(--color-text-muted)] max-w-[260px] leading-relaxed mb-4">
          {description}
        </p>
      )}
      {action}
    </motion.div>
  );
}
