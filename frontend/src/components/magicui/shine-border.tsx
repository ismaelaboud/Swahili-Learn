"use client";

import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface ShineBorderProps extends HTMLAttributes<HTMLDivElement> {
  borderWidth?: string;
  duration?: number;
  delay?: number;
  color?: string[];
  className?: string;
  children?: React.ReactNode;
  background?: string;
  shouldHover?: boolean;
}

export default function ShineBorder({
  borderWidth = "1px",
  duration = 4,
  delay = 0,
  color = ["#8678F9", "#c7d2fe", "#FFBE7B"],
  className,
  children,
  background = "transparent",
  shouldHover = true,
  ...props
}: ShineBorderProps) {
  const gradientColors = color.map((c) => `${c}33`).join(", "); // 33 is 20% opacity in hex

  return (
    <div
      className={cn(
        "group relative rounded-lg",
        "before:absolute before:inset-0 before:rounded-lg before:p-[1px]",
        "before:bg-gradient-to-r",
        shouldHover && "shine-border hover:before:opacity-100",
        className
      )}
      style={{
        "--border-gradient": `linear-gradient(to right, ${color.join(", ")})`,
        "--shine-gradient": `linear-gradient(to right, transparent, ${gradientColors}, transparent)`,
      } as React.CSSProperties}
      {...props}
    >
      <div
        className="relative h-full w-full rounded-lg bg-background"
        style={{ background }}
      >
        {children}
      </div>
    </div>
  );
}