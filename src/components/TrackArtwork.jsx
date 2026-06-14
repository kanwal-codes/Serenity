"use client";

import { Play, Pause, Music2 } from "lucide-react";
import { cn } from "@/lib/utils";

const SIZE_CLASSES = {
  sm: "h-10 w-10 rounded-lg",
  md: "h-11 w-11 rounded-lg",
  lg: "aspect-square w-full rounded-xl",
};

export function TrackArtwork({
  src,
  alt = "",
  size = "sm",
  isActive = false,
  isPlaying = false,
  className,
}) {
  return (
    <div
      className={cn(
        "track-artwork relative shrink-0 overflow-hidden",
        SIZE_CLASSES[size],
        className
      )}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover transition-transform duration-300 group-hover/track:scale-105"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-muted">
          <Music2 className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center bg-black/45 opacity-0 transition-opacity duration-200",
          "group-hover/track:opacity-100",
          isActive && "opacity-100 bg-black/35"
        )}
        aria-hidden
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/30 shadow-sm backdrop-blur-[2px] transition-transform duration-200 group-hover/track:scale-105">
          {isActive && isPlaying ? (
            <Pause className="h-3.5 w-3.5 fill-white text-white" />
          ) : (
            <Play className="ml-0.5 h-3.5 w-3.5 fill-white text-white" />
          )}
        </span>
      </div>
    </div>
  );
}
