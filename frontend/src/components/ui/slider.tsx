"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

type SliderVariant = "default" | "destructive" | "warning" | "success";

type SliderProps = React.ComponentPropsWithoutRef<
  typeof SliderPrimitive.Root
> & {
  variant?: SliderVariant;
};

const variantClasses = (v: SliderVariant = "default") => {
  switch (v) {
    case "destructive":
      return {
        track: "bg-red-500/20",
        range: "bg-red-500",
        thumbBorder: "border-red-500/50",
        ring: "focus-visible:ring-red-500",
      };
    case "warning":
      return {
        track: "bg-amber-500/20",
        range: "bg-amber-500",
        thumbBorder: "border-amber-500/50",
        ring: "focus-visible:ring-amber-500",
      };
    case "success":
      return {
        track: "bg-emerald-500/20",
        range: "bg-emerald-500",
        thumbBorder: "border-emerald-500/50",
        ring: "focus-visible:ring-emerald-500",
      };
    case "default":
    default:
      return {
        track: "bg-primary/20",
        range: "bg-primary",
        thumbBorder: "border-primary/50",
        ring: "focus-visible:ring-ring",
      };
  }
};

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, variant = "default", ...props }, ref) => {
  const v = variantClasses(variant);

  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track
        className={cn(
          "relative h-1.5 w-full grow overflow-hidden rounded-full",
          v.track
        )}
      >
        <SliderPrimitive.Range className={cn("absolute h-full", v.range)} />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        className={cn(
          "block h-4 w-4 rounded-full border bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50",
          v.thumbBorder,
          v.ring
        )}
      />
    </SliderPrimitive.Root>
  );
});

export { Slider };
