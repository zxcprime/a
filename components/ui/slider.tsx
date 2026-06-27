"use client";

import * as React from "react";
import { Slider as SliderPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";
interface Segment {
  start_sec: number;
  end_sec: number;
}

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  color,
  intro,
  outro,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root> & {
  color?: string;
  intro?: Segment | null;
  outro?: Segment | null;
}) {
  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max],
  );

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        "data-vertical:min-h-40 relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-vertical:h-full data-vertical:w-auto data-vertical:flex-col cursor-pointer",
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className="bg-foreground/20 rounded-full group-hover:data-horizontal:h-2.5 data-horizontal:h-1.5   data-horizontal:landscape:h-1 data-vertical:w-1 relative grow overflow-hidden data-horizontal:w-full data-vertical:h-full transition duration-200"
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className="absolute select-none data-horizontal:h-full data-vertical:w-full rounded-full"
          style={{ backgroundColor: `#${color}` }}
        />
      </SliderPrimitive.Track>

      {intro && max > 0 && (
        <div
          className="absolute h-full  pointer-events-none"
          style={{
            left: `${(intro.start_sec / max) * 100}%`,
            width: `${((intro.end_sec - intro.start_sec) / max) * 100}%`,
            backgroundColor: "#facc15",
          }}
        />
      )}
      {/* Outro marker */}
      {outro && max > 0 && (
        <div
          className="absolute h-full  pointer-events-none"
          style={{
            left: `${(outro.start_sec / max) * 100}%`,
            width: `${((outro.end_sec - outro.start_sec) / max) * 100}%`,
            backgroundColor: "#fb923c",
          }}
        />
      )}
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          className="md:opacity-0 opacity-100 group-hover:opacity-100 transition duration-200 border-ring ring-ring/50 relative md:h-5 h-4 md:w-2 w-1.5 rounded-full border bg-white  after:absolute after:-inset-2 hover:ring-3 focus-visible:ring-3 focus-visible:outline-hidden active:ring-3 block shrink-0 select-none disabled:pointer-events-none disabled:opacity-50"
        />
      ))}
    </SliderPrimitive.Root>
  );
}

export { Slider };
