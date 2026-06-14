"use client";

import { Play, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { TrackArtwork } from "@/components/TrackArtwork";

function PlayingBars() {
  return (
    <span className="flex h-3.5 items-end gap-0.5">
      <span className="inline-block h-full w-0.5 animate-pulse bg-primary" />
      <span
        className="inline-block h-2/3 w-0.5 animate-pulse bg-primary"
        style={{ animationDelay: "0.15s" }}
      />
      <span
        className="inline-block h-full w-0.5 animate-pulse bg-primary"
        style={{ animationDelay: "0.3s" }}
      />
    </span>
  );
}

export function TrackListHeader({ showAlbum = true }) {
  return (
    <div
      className={cn(
        "grid gap-4 border-b border-border px-4 py-3 font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground",
        showAlbum
          ? "grid-cols-[auto_1fr_auto] max-sm:hidden sm:grid-cols-[auto_1fr_1fr_auto_auto]"
          : "grid-cols-[auto_1fr_auto_auto] max-sm:hidden sm:grid-cols-[auto_1fr_auto_auto]"
      )}
    >
      <span className="w-8 text-center">#</span>
      <span>Title</span>
      {showAlbum && <span className="hidden sm:block">Album</span>}
      <span className={cn("text-right", showAlbum ? "hidden w-16 sm:block" : "w-16")}>
        <Clock className={cn(showAlbum ? "ml-auto" : "mx-auto", "h-3.5 w-3.5")} />
      </span>
      {showAlbum && <span className="hidden w-10 sm:block" />}
    </div>
  );
}

export function TrackListRow({
  track,
  index,
  active = false,
  isPlaying = false,
  onPlay,
  showAlbum = true,
  imageUrl,
  subtitle,
  className,
}) {
  const cover = imageUrl ?? track.images?.[0]?.url;
  const secondary = subtitle ?? track.album;

  return (
    <button
      type="button"
      onClick={onPlay}
      className={cn(
        "track-row group/track grid w-full cursor-pointer items-center gap-4 border-none px-4 py-2.5 text-left",
        showAlbum
          ? "grid-cols-[auto_1fr_auto] sm:grid-cols-[auto_1fr_1fr_auto_auto]"
          : "grid-cols-[auto_1fr_auto] sm:grid-cols-[auto_1fr_auto_auto]",
        active ? "track-row-active bg-primary/10" : "bg-transparent",
        className
      )}
    >
      <span className="flex w-8 items-center justify-center font-body text-sm tabular-nums text-muted-foreground">
        {active && isPlaying ? (
          <PlayingBars />
        ) : (
          <>
            <span className="group-hover/track:hidden">{index + 1}</span>
            <Play className="hidden h-4 w-4 text-foreground group-hover/track:block" />
          </>
        )}
      </span>

      <div className="flex min-w-0 items-center gap-3">
        <TrackArtwork
          src={cover}
          alt={track.album ?? track.name}
          isActive={active}
          isPlaying={isPlaying}
        />
        <div className="min-w-0">
          <p
            className={cn(
              "truncate font-display text-sm font-semibold transition-colors duration-200",
              active ? "text-primary" : "text-foreground group-hover/track:text-foreground"
            )}
          >
            {track.name ?? track.title}
          </p>
          <p className="truncate font-body text-xs text-muted-foreground">
            {track.artist}
          </p>
          {showAlbum && secondary && (
            <p className="truncate font-body text-xs text-muted-foreground sm:hidden">
              {secondary}
            </p>
          )}
        </div>
      </div>

      {showAlbum && (
        <p className="hidden truncate font-body text-sm text-muted-foreground sm:block">
          {secondary}
        </p>
      )}

      <span
        className={cn(
          "text-right font-body text-xs tabular-nums text-muted-foreground",
          showAlbum ? "hidden w-16 sm:block" : "w-16"
        )}
      >
        {track.duration_formatted ?? track.duration}
      </span>

      {showAlbum && <span className="hidden w-10 sm:block" />}
    </button>
  );
}
