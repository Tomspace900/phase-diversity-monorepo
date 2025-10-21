import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const alertVariants = cva("relative w-full rounded-lg border", {
  variants: {
    variant: {
      default: "bg-background text-foreground border-border",
      info: "bg-info/10 border-info/30 text-info",
      success: "bg-success/10 border-success/30 text-success",
      warning: "bg-warning/10 border-warning/30 text-warning",
      destructive: "bg-destructive/10 border-destructive/30 text-destructive",
    },
    size: {
      xs: "p-2",
      sm: "p-3",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "sm",
  },
});

const titleVariants = cva("font-semibold leading-none tracking-tight", {
  variants: {
    size: {
      xs: "text-xs mb-1",
      sm: "text-sm mb-2",
    },
  },
  defaultVariants: {
    size: "sm",
  },
});

const descriptionVariants = cva("[&_p]:leading-relaxed", {
  variants: {
    size: {
      xs: "text-xs",
      sm: "text-sm",
    },
  },
  defaultVariants: {
    size: "sm",
  },
});

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  icon?: React.ReactNode;
  title?: string;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, size, icon, title, children, ...props }, ref) => (
    <div
      ref={ref}
      role="alert"
      className={cn(alertVariants({ variant, size }), className)}
      {...props}
    >
      <div className="flex gap-2 items-center">
        {icon && <span className="flex-shrink-0 self-start">{icon}</span>}
        <div className="flex-1 min-w-0">
          {title && <h5 className={cn(titleVariants({ size }))}>{title}</h5>}
          <div className={cn(descriptionVariants({ size }))}>{children}</div>
        </div>
      </div>
    </div>
  )
);
Alert.displayName = "Alert";

export { Alert };
