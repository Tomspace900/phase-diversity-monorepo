import * as React from "react";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type CTAColor =
  | "primary"
  | "secondary"
  | "green"
  | "cyan"
  | "purple"
  | "pink"
  | "orange"
  | "success"
  | "warning"
  | "error";
type CTAVariant = "default" | "outline" | "ghost";

const colorStyles: Record<
  CTAColor,
  {
    bg: string;
    border: string;
    icon: string;
    text: string;
  }
> = {
  primary: {
    bg: "bg-primary/10 hover:bg-primary/20",
    border: "border border-primary/20",
    icon: "text-primary",
    text: "bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent",
  },
  secondary: {
    bg: "bg-muted/50 hover:bg-muted",
    border: "border border-border",
    icon: "text-muted-foreground",
    text: "text-foreground",
  },
  green: {
    bg: "bg-accent-green/10 hover:bg-accent-green/20",
    border: "border border-accent-green/20",
    icon: "text-accent-green",
    text: "bg-gradient-to-r from-accent-green to-primary bg-clip-text text-transparent",
  },
  cyan: {
    bg: "bg-accent-cyan/10 hover:bg-accent-cyan/20",
    border: "border border-accent-cyan/20",
    icon: "text-accent-cyan",
    text: "bg-gradient-to-r from-accent-cyan to-primary bg-clip-text text-transparent",
  },
  purple: {
    bg: "bg-accent-purple/10 hover:bg-accent-purple/20",
    border: "border border-accent-purple/20",
    icon: "text-accent-purple",
    text: "bg-gradient-to-r from-accent-purple to-primary bg-clip-text text-transparent",
  },
  pink: {
    bg: "bg-accent-pink/10 hover:bg-accent-pink/20",
    border: "border border-accent-pink/20",
    icon: "text-accent-pink",
    text: "bg-gradient-to-r from-accent-pink to-primary bg-clip-text text-transparent",
  },
  orange: {
    bg: "bg-accent-orange/10 hover:bg-accent-orange/20",
    border: "border border-accent-orange/20",
    icon: "text-accent-orange",
    text: "bg-gradient-to-r from-accent-orange to-primary bg-clip-text text-transparent",
  },
  success: {
    bg: "bg-success/10 hover:bg-success/20",
    border: "border border-success/20",
    icon: "text-success",
    text: "bg-gradient-to-r from-success to-success/80 bg-clip-text text-transparent",
  },
  warning: {
    bg: "bg-warning/10 hover:bg-warning/20",
    border: "border border-warning/20",
    icon: "text-warning",
    text: "bg-gradient-to-r from-warning to-warning/80 bg-clip-text text-transparent",
  },
  error: {
    bg: "bg-error/10 hover:bg-error/20",
    border: "border border-error/20",
    icon: "text-error",
    text: "bg-gradient-to-r from-error to-error/80 bg-clip-text text-transparent",
  },
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  color?: CTAColor;
  variant?: CTAVariant;
  size?: "sm" | "md" | "lg" | "icon";
  loading?: boolean;
  children?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      icon: Icon,
      iconPosition = "left",
      color = "primary",
      variant = "default",
      size = "sm",
      loading = false,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const colorStyle = colorStyles[color];
    const isIconOnly = size === "icon";

    const sizeClasses = {
      sm: "gap-1.5 px-3 py-1.5 text-sm",
      md: "gap-2 px-4 py-2 text-base",
      lg: "gap-2.5 px-5 py-2.5 text-base",
      icon: "p-2",
    };

    const iconSizeClasses = {
      sm: "h-4 w-4",
      md: "h-4 w-4",
      lg: "h-5 w-5",
      icon: "h-4 w-4",
    };

    const variantClasses = {
      default: cn(colorStyle.bg, colorStyle.border),
      outline: cn("bg-transparent hover:bg-muted/50", colorStyle.border),
      ghost: "bg-transparent hover:bg-muted/50 border-transparent",
    };

    const textClasses = {
      default: colorStyle.text,
      outline: colorStyle.text,
      ghost: colorStyle.text,
    };

    const iconClasses = {
      default: colorStyle.icon,
      outline: colorStyle.icon,
      ghost: colorStyle.icon,
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "group inline-flex items-center justify-center",
          "rounded-md font-semibold transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          variantClasses[variant],
          sizeClasses[size],
          Icon && !isIconOnly && "flex-nowrap",
          (disabled || loading) && "opacity-50 cursor-not-allowed",
          className
        )}
        {...props}
      >
        {isIconOnly ? (
          Icon ? (
            <Icon
              className={cn(
                iconSizeClasses[size],
                iconClasses[variant],
                "transition-transform group-hover:scale-110",
                loading && "animate-spin"
              )}
            />
          ) : (
            <>{children}</>
          )
        ) : (
          <>
            {Icon && iconPosition === "left" && (
              <Icon
                className={cn(
                  iconSizeClasses[size],
                  iconClasses[variant],
                  "transition-transform group-hover:scale-110 flex-shrink-0",
                  loading && "animate-spin"
                )}
              />
            )}
            {children && (
              <span
                className={cn(
                  "font-medium inline-flex flex-nowrap items-center space-x-2",
                  textClasses[variant]
                )}
              >
                {children}
              </span>
            )}
            {Icon && iconPosition === "right" && (
              <Icon
                className={cn(
                  iconSizeClasses[size],
                  iconClasses[variant],
                  "transition-transform group-hover:scale-110 group-hover:translate-x-0.5 flex-shrink-0",
                  loading && "animate-spin"
                )}
              />
            )}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
