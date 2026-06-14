"use client";

import { useState, useCallback, useRef } from "react";
import {
  Home,
  Search,
  Users,
  MessageCircle,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Shuffle,
  Repeat,
  Repeat1,
  Heart,
  ListMusic,
  ChevronLeft,
  ChevronRight,
  Library,
  LogIn,
  LogOut,
  ExternalLink,
  Loader2,
  Music2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSpotify } from "@/contexts/SpotifyContext";
import { usePlayer } from "@/contexts/PlayerContext";
import { Button } from "@/components/ui/button";

const navItems = [
  { id: "home", label: "Home", Icon: Home },
  { id: "search", label: "Search", Icon: Search },
  { id: "feed", label: "Feed", Icon: Users },
  { id: "chat", label: "Messages", Icon: MessageCircle },
];

function NavRailButton({ label, Icon, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      aria-label={label}
      className="group relative flex w-full cursor-pointer flex-col items-center gap-1 border-none bg-transparent px-1 py-1.5 outline-none"
    >
      <div
        className={cn(
          "flex h-10 w-14 items-center justify-center rounded-[20px] transition-colors",
          active ? "bg-sidebar-accent" : "group-hover:bg-sidebar-accent/60"
        )}
      >
        <Icon
          className={cn(
            "h-[22px] w-[22px] transition-colors",
            active ? "text-primary" : "text-[var(--on-surface-variant)] group-hover:text-foreground"
          )}
        />
      </div>
      <span
        className={cn(
          "max-w-[72px] truncate font-display text-[11px] leading-none transition-colors",
          active ? "font-semibold text-primary" : "font-normal text-[var(--on-surface-variant)]"
        )}
      >
        {label}
      </span>
    </button>
  );
}

function SpotifyLibraryPanel({ collapsed, onSelectLibrary, librarySelection }) {
  const { isConnected, loading, profile, playlists, connect, disconnect } = useSpotify();

  if (collapsed) {
    return null;
  }

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="border-b border-sidebar-border px-4 py-4">
        <div className="flex items-center gap-2">
          <Library className="h-5 w-5 text-primary" />
          <h2 className="font-display text-sm font-bold text-foreground">Your Library</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 scrollbar-none">
        {loading ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : !isConnected ? (
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--spotify-green)]/15">
              <Music2 className="h-5 w-5 text-[var(--spotify-green)]" />
            </div>
            <p className="font-display text-sm font-semibold text-foreground">
              Connect Spotify
            </p>
            <p className="mt-1 font-body text-xs leading-relaxed text-muted-foreground">
              Sync your playlists, recently played, and search millions of tracks.
            </p>
            <Button
              onClick={connect}
              className="mt-4 w-full bg-[var(--spotify-green)] text-white hover:bg-[var(--spotify-green)]/90"
              size="sm"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Connect Spotify
            </Button>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={() =>
                onSelectLibrary({
                  type: "liked",
                  id: "liked",
                  name: "Liked Songs",
                })
              }
              className={cn(
                "mb-1 flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-sidebar-accent",
                librarySelection?.type === "liked" && "bg-sidebar-accent"
              )}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/40 to-[var(--m3-tertiary)]/40">
                <Heart className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="truncate font-display text-sm font-semibold text-foreground">
                  Liked Songs
                </p>
                <p className="font-body text-xs text-muted-foreground">Spotify saved tracks</p>
              </div>
            </button>

            <p className="mb-2 mt-4 px-2 font-display text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Playlists
            </p>

            {playlists.length === 0 ? (
              <p className="px-2 font-body text-xs text-muted-foreground">
                No playlists found on your Spotify account.
              </p>
            ) : (
              <div className="space-y-0.5">
                {playlists.map((playlist) => (
                  <button
                    key={playlist.id}
                    type="button"
                    onClick={() =>
                      onSelectLibrary({
                        type: "playlist",
                        id: playlist.id,
                        name: playlist.name,
                        description: playlist.description,
                        images: playlist.images,
                        owner: playlist.owner,
                        tracks: playlist.tracks,
                        external_urls: playlist.external_urls,
                      })
                    }
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-sidebar-accent",
                      librarySelection?.type === "playlist" &&
                        librarySelection?.id === playlist.id &&
                        "bg-sidebar-accent"
                    )}
                  >
                    {playlist.images?.[0]?.url ? (
                      <img
                        src={playlist.images[0].url}
                        alt={playlist.name}
                        className="h-10 w-10 shrink-0 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <Music2 className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-sm font-medium text-foreground">
                        {playlist.name}
                      </p>
                      <p className="truncate font-body text-xs text-muted-foreground">
                        {playlist.tracks?.total ?? 0} tracks
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <div className="border-t border-sidebar-border p-3">
        {isConnected && profile ? (
          <div className="flex items-center gap-2 rounded-xl bg-sidebar-accent/60 p-2">
            {profile.images?.[0]?.url ? (
              <img
                src={profile.images[0].url}
                alt={profile.display_name}
                className="h-9 w-9 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-m3-primary font-display text-sm font-bold text-primary-foreground">
                {profile.display_name?.[0]?.toUpperCase() ?? "S"}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-sm font-semibold text-foreground">
                {profile.display_name}
              </p>
              <p className="truncate font-body text-[11px] text-[var(--spotify-green)]">
                Spotify connected
              </p>
            </div>
            <button
              type="button"
              onClick={disconnect}
              aria-label="Disconnect Spotify"
              className="cursor-pointer rounded-lg border-none bg-transparent p-1.5 text-muted-foreground outline-none hover:bg-sidebar-accent hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          !loading && (
            <button
              type="button"
              onClick={connect}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-border bg-card py-2 font-display text-xs font-semibold text-primary outline-none transition-colors hover:bg-sidebar-accent"
            >
              <LogIn className="h-3.5 w-3.5" />
              Connect Spotify
            </button>
          )
        )}
      </div>
    </aside>
  );
}

function QueuePanel({
  open,
  onClose,
  queueTracks,
  queueIndex,
  isPlaying,
  onPlayFromQueue,
}) {
  if (!open || queueTracks.length === 0) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Close queue"
        className="fixed inset-0 z-40 cursor-default border-none bg-black/20 outline-none"
        onClick={onClose}
      />
      <div className="absolute bottom-full right-4 z-50 mb-2 flex max-h-80 w-72 flex-col overflow-hidden rounded-2xl border border-border bg-[var(--surface-container-high)] shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="font-display text-sm font-semibold text-foreground">Up Next</p>
          <span className="font-body text-xs text-muted-foreground">
            {queueTracks.length} tracks
          </span>
        </div>
        <ul className="flex-1 overflow-y-auto py-1 scrollbar-none">
          {queueTracks.map((track, index) => (
            <li key={`${track.id}-${index}`}>
              <button
                type="button"
                onClick={() => onPlayFromQueue(index)}
                className={cn(
                  "flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-sidebar-accent",
                  index === queueIndex && "bg-sidebar-accent/80"
                )}
              >
                {track.cover ? (
                  <img
                    src={track.cover}
                    alt=""
                    className="h-9 w-9 shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Music2 className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "truncate font-display text-sm",
                      index === queueIndex
                        ? "font-semibold text-primary"
                        : "font-medium text-foreground"
                    )}
                  >
                    {track.name}
                  </p>
                  <p className="truncate font-body text-xs text-muted-foreground">
                    {track.artist}
                  </p>
                </div>
                {index === queueIndex && (
                  <span className="font-body text-[10px] font-semibold uppercase tracking-wide text-primary">
                    {isPlaying ? "Now" : "Paused"}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

function SeekBar({ progress, onSeek }) {
  const barRef = useRef(null);
  const draggingRef = useRef(false);

  const fractionFromEvent = useCallback((clientX) => {
    const bar = barRef.current;
    if (!bar) return 0;
    const rect = bar.getBoundingClientRect();
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  }, []);

  const handleSeek = useCallback(
    (clientX) => {
      onSeek(fractionFromEvent(clientX));
    },
    [fractionFromEvent, onSeek]
  );

  const handlePointerDown = useCallback(
    (e) => {
      draggingRef.current = true;
      barRef.current?.setPointerCapture(e.pointerId);
      handleSeek(e.clientX);
    },
    [handleSeek]
  );

  const handlePointerMove = useCallback(
    (e) => {
      if (!draggingRef.current) return;
      handleSeek(e.clientX);
    },
    [handleSeek]
  );

  const handlePointerUp = useCallback((e) => {
    draggingRef.current = false;
    barRef.current?.releasePointerCapture(e.pointerId);
  }, []);

  return (
    <div
      ref={barRef}
      role="slider"
      aria-label="Seek"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress)}
      className="relative h-1 flex-1 cursor-pointer touch-none rounded-sm bg-muted"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <div
        className="pointer-events-none h-full rounded-sm bg-m3-primary"
        style={{ width: `${progress}%` }}
      />
      <div
        className="pointer-events-none absolute top-1/2 h-3 w-3 rounded-full bg-m3-primary"
        style={{ left: `${progress}%`, transform: "translate(-50%, -50%)" }}
      />
    </div>
  );
}

export function MainNavigation({
  currentPage,
  onPageChange,
  librarySelection,
  onSelectLibrary,
  children,
}) {
  const [libraryCollapsed, setLibraryCollapsed] = useState(false);
  const [queueOpen, setQueueOpen] = useState(false);
  const { isConnected } = useSpotify();
  const {
    currentTrack,
    isPlaying,
    togglePlayPause,
    playNext,
    playPrevious,
    currentTime,
    duration,
    progress,
    volume,
    seek,
    setVolume,
    shuffle,
    repeatMode,
    isLiked,
    toggleShuffle,
    toggleRepeat,
    toggleLike,
    queueTracks,
    queueIndex,
    playFromQueue,
  } = usePlayer();

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground">
      <div className="flex flex-1 overflow-hidden">
        {/* Navigation Rail */}
        <nav className="flex w-20 shrink-0 flex-col items-center gap-1 border-r border-sidebar-border bg-sidebar py-5">
          <button
            type="button"
            onClick={() => onPageChange("home")}
            className="mb-5 flex cursor-pointer flex-col items-center gap-1 border-none bg-transparent outline-none"
          >
            <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-m3-primary">
              <span className="font-display text-lg font-extrabold text-primary-foreground">S</span>
              {isConnected && (
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-sidebar bg-[var(--spotify-green)]" />
              )}
            </div>
            <span className="font-display text-[10px] font-semibold tracking-widest text-primary">
              SERENITY
            </span>
          </button>

          {navItems.map(({ id, label, Icon }) => (
            <NavRailButton
              key={id}
              label={label}
              Icon={Icon}
              active={currentPage === id}
              onClick={() => onPageChange(id)}
            />
          ))}

          <div className="flex-1" />

          <button
            type="button"
            onClick={() => setLibraryCollapsed(!libraryCollapsed)}
            aria-label={libraryCollapsed ? "Expand library" : "Collapse library"}
            className="flex w-full cursor-pointer flex-col items-center gap-1 border-none bg-transparent px-1 py-1.5 outline-none"
          >
            <div className="flex h-10 w-14 items-center justify-center rounded-[20px] transition-colors hover:bg-sidebar-accent">
              {libraryCollapsed ? (
                <ChevronRight className="h-5 w-5 text-[var(--on-surface-variant)]" />
              ) : (
                <ChevronLeft className="h-5 w-5 text-[var(--on-surface-variant)]" />
              )}
            </div>
            <span className="font-display text-[11px] text-[var(--on-surface-variant)]">Library</span>
          </button>
        </nav>

        <SpotifyLibraryPanel
          collapsed={libraryCollapsed}
          onSelectLibrary={onSelectLibrary}
          librarySelection={librarySelection}
        />

        {/* Main content */}
        <div className="relative flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-background">
          {children}
        </div>
      </div>

      {/* Now Playing Bar — always visible when a track is loaded */}
      {currentTrack ? (
        <div className="relative z-50 flex h-[88px] shrink-0 items-center gap-4 border-t border-border bg-[var(--surface-container)] px-4 shadow-[0_-4px_24px_rgba(0,0,0,0.35)] backdrop-blur-3xl">
          <div className="flex min-w-[200px] items-center gap-3" style={{ width: 260 }}>
            {currentTrack.cover ? (
              <img
                src={currentTrack.cover}
                alt={currentTrack.name}
                className="h-12 w-12 shrink-0 rounded-xl object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-m3-primary">
                <Play className="h-5 w-5 text-primary-foreground" />
              </div>
            )}
            <div className="min-w-0 overflow-hidden">
              <p className="truncate font-display text-sm font-semibold text-foreground">
                {currentTrack.name}
              </p>
              <p className="truncate font-body text-xs text-muted-foreground">
                {currentTrack.artist}
              </p>
            </div>
            <button
              type="button"
              onClick={toggleLike}
              aria-label={isLiked ? "Remove from Liked Songs" : "Save to Liked Songs"}
              className="ml-2 shrink-0 cursor-pointer border-none bg-transparent outline-none"
            >
              <Heart
                className={cn(
                  "h-5 w-5 transition-colors",
                  isLiked ? "fill-primary text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              />
            </button>
          </div>

          <div className="flex max-w-md flex-1 flex-col items-center gap-2">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={toggleShuffle}
                aria-label={shuffle ? "Disable shuffle" : "Enable shuffle"}
                aria-pressed={shuffle}
                className="cursor-pointer border-none bg-transparent outline-none"
              >
                <Shuffle
                  className={cn(
                    "h-[18px] w-[18px] transition-colors",
                    shuffle ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                />
              </button>
              <button type="button" onClick={playPrevious} className="cursor-pointer border-none bg-transparent outline-none">
                <SkipBack className="h-[26px] w-[26px] text-foreground" />
              </button>
              <button
                type="button"
                onClick={togglePlayPause}
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border-none bg-m3-primary outline-none transition-transform active:scale-95"
              >
                {isPlaying ? (
                  <Pause className="h-6 w-6 text-primary-foreground" />
                ) : (
                  <Play className="ml-0.5 h-6 w-6 text-primary-foreground" />
                )}
              </button>
              <button type="button" onClick={playNext} className="cursor-pointer border-none bg-transparent outline-none">
                <SkipForward className="h-[26px] w-[26px] text-foreground" />
              </button>
              <button
                type="button"
                onClick={toggleRepeat}
                aria-label={
                  repeatMode === "one"
                    ? "Repeat one"
                    : repeatMode === "all"
                      ? "Repeat all"
                      : "Repeat off"
                }
                aria-pressed={repeatMode !== "off"}
                className="cursor-pointer border-none bg-transparent outline-none"
              >
                {repeatMode === "one" ? (
                  <Repeat1
                    className="h-[18px] w-[18px] text-primary"
                  />
                ) : (
                  <Repeat
                    className={cn(
                      "h-[18px] w-[18px] transition-colors",
                      repeatMode === "all"
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  />
                )}
              </button>
            </div>

            <div className="flex w-full max-w-[500px] items-center gap-2">
              <span className="min-w-8 text-right font-body text-[11px] tabular-nums text-muted-foreground">
                {currentTime}
              </span>
              <SeekBar progress={progress} onSeek={seek} />
              <span className="min-w-8 font-body text-[11px] tabular-nums text-muted-foreground">
                {duration}
              </span>
            </div>
          </div>

          <div className="relative flex min-w-[160px] items-center justify-end gap-3" style={{ width: 200 }}>
            <QueuePanel
              open={queueOpen}
              onClose={() => setQueueOpen(false)}
              queueTracks={queueTracks}
              queueIndex={queueIndex}
              isPlaying={isPlaying}
              onPlayFromQueue={(index) => {
                playFromQueue(index);
                setQueueOpen(false);
              }}
            />
            {currentTrack.external_urls?.spotify && (
              <a
                href={currentTrack.external_urls.spotify}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground transition-colors hover:text-primary"
                aria-label="Open in Spotify"
              >
                <ExternalLink className="h-5 w-5" />
              </a>
            )}
            <button
              type="button"
              onClick={() => setQueueOpen((open) => !open)}
              aria-label="Show queue"
              aria-expanded={queueOpen}
              className="cursor-pointer border-none bg-transparent outline-none"
            >
              <ListMusic
                className={cn(
                  "h-5 w-5 transition-colors",
                  queueOpen ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              />
            </button>
            <Volume2 className="h-5 w-5 text-muted-foreground" />
            <div
              className="relative h-1 w-20 cursor-pointer rounded-sm bg-muted"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setVolume((e.clientX - rect.left) / rect.width);
              }}
            >
              <div
                className="h-full rounded-sm bg-muted-foreground transition-all"
                style={{ width: `${volume * 100}%` }}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
