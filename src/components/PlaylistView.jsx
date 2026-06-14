"use client";

import { useEffect, useState } from "react";
import {
  Play,
  Pause,
  Loader2,
  Music2,
  ExternalLink,
} from "lucide-react";
import spotifyAPI from "@/lib/spotify";
import { usePlayer } from "@/contexts/PlayerContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { TrackListHeader, TrackListRow } from "@/components/TrackListRow";
import { StickyBackBar } from "@/components/StickyBackBar";

export function PlaylistView({ selection, onBack }) {
  const { playTrack, playQueue, currentTrack, isPlaying, togglePlayPause } =
    usePlayer();
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState(selection);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setMeta(selection);

      try {
        if (selection.type === "liked") {
          const saved = await spotifyAPI.getAllSavedTracks(200);
          if (!cancelled) {
            setTracks(saved);
            setMeta({
              ...selection,
              name: "Liked Songs",
              description: "Your saved tracks on Spotify",
              tracks: { total: saved.length },
            });
          }
        } else if (selection.type === "explore") {
          const results = await spotifyAPI.searchTracks(selection.query, 50);
          if (!cancelled) {
            setTracks(results);
            setMeta({
              ...selection,
              tracks: { total: results.length },
            });
          }
        } else {
          const [playlist, playlistTracks] = await Promise.all([
            spotifyAPI.getPlaylist(selection.id),
            spotifyAPI.getAllPlaylistTracks(selection.id, 200),
          ]);
          if (!cancelled) {
            setTracks(playlistTracks);
            if (playlist) {
              setMeta({
                type: "playlist",
                id: playlist.id,
                name: playlist.name,
                description: playlist.description,
                images: playlist.images,
                owner: playlist.owner,
                tracks: playlist.tracks,
                external_urls: playlist.external_urls,
              });
            }
          }
        }
      } catch (error) {
        console.error("Failed to load playlist:", error);
        if (!cancelled) setTracks([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [selection]);

  const cover = meta?.images?.[0]?.url;
  const totalTracks = meta?.tracks?.total ?? tracks.length;
  const isPlayingFromThis =
    currentTrack && tracks.some((t) => t.id === currentTrack.id) && isPlaying;

  const collectionLabel =
    selection.type === "liked"
      ? "Collection"
      : selection.type === "explore"
        ? selection.exploreKind === "genre"
          ? "Genre"
          : "Mood"
        : "Playlist";

  const handlePlayAll = () => {
    if (tracks.length === 0) return;
    if (isPlayingFromThis) {
      togglePlayPause();
    } else {
      playQueue(tracks, 0);
    }
  };

  const handlePlayTrack = (track) => {
    if (currentTrack?.id === track.id) {
      togglePlayPause();
    } else {
      playTrack(track, tracks);
    }
  };

  return (
    <div className="page-scroll ambient-glow">
      <StickyBackBar onBack={onBack} />
      <div className="page-content pb-10 pt-4">
        {selection.type === "explore" && cover ? (
          <div className="relative mb-8 overflow-hidden rounded-[28px]">
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to bottom, rgba(15,13,19,0.2) 0%, rgba(15,13,19,0.92) 70%), url(${cover}) center/cover`,
              }}
            />
            <div className="relative flex flex-col gap-5 px-6 py-8 sm:flex-row sm:items-end">
              <img
                src={cover}
                alt={meta?.name}
                className="h-40 w-40 shrink-0 rounded-2xl object-cover shadow-2xl sm:h-44 sm:w-44"
              />
              <div className="min-w-0 flex-1 pb-1">
                <p className="font-display text-xs font-semibold uppercase tracking-widest text-white/70">
                  {collectionLabel}
                </p>
                <h1 className="font-display text-3xl font-extrabold text-white sm:text-4xl">
                  {meta?.name}
                </h1>
                {meta?.description && (
                  <p className="mt-2 font-body text-sm text-white/75">{meta.description}</p>
                )}
                <p className="mt-2 font-body text-sm text-white/60">
                  {loading ? "Loading…" : `${totalTracks} tracks`}
                </p>
                <div className="mt-5">
                  <Button
                    onClick={handlePlayAll}
                    disabled={loading || tracks.length === 0}
                    className="rounded-full bg-m3-primary px-8 font-display font-bold text-primary-foreground hover:bg-m3-primary/90"
                  >
                    {isPlayingFromThis ? (
                      <>
                        <Pause className="mr-2 h-5 w-5" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-5 w-5" />
                        Play All
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
        <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end">
          {cover ? (
            <img
              src={cover}
              alt={meta.name}
              className="h-44 w-44 shrink-0 rounded-2xl object-cover shadow-xl"
            />
          ) : (
            <div
              className="flex h-44 w-44 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/30 to-[var(--m3-tertiary)]/30"
              style={
                selection.type === "explore" && selection.accentBg
                  ? { background: selection.accentBg }
                  : undefined
              }
            >
              <Music2
                className={cn(
                  "h-16 w-16",
                  !(selection.type === "explore" && selection.accentColor) && "text-primary"
                )}
                style={
                  selection.type === "explore" && selection.accentColor
                    ? { color: selection.accentColor }
                    : undefined
                }
              />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <p className="font-display text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {collectionLabel}
            </p>
            <h1 className="font-display text-3xl font-extrabold text-foreground sm:text-4xl">
              {meta?.name || "Playlist"}
            </h1>
            {meta?.description && (
              <p className="mt-2 line-clamp-2 font-body text-sm text-muted-foreground">
                {meta.description}
              </p>
            )}
            <p className="mt-2 font-body text-sm text-muted-foreground">
              {meta?.owner?.display_name && (
                <span>{meta.owner.display_name} · </span>
              )}
              {totalTracks} tracks
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Button
                onClick={handlePlayAll}
                disabled={loading || tracks.length === 0}
                className="rounded-full bg-m3-primary px-8 font-display font-bold text-primary-foreground hover:bg-m3-primary/90"
              >
                {isPlayingFromThis ? (
                  <>
                    <Pause className="mr-2 h-5 w-5" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-5 w-5" />
                    Play All
                  </>
                )}
              </Button>
              {meta?.external_urls?.spotify && (
                <a
                  href={meta.external_urls.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 font-body text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open in Spotify
                </a>
              )}
            </div>
          </div>
        </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
            Loading tracks…
          </div>
        ) : tracks.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card py-16 text-center">
            <Music2 className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <p className="font-display text-lg font-semibold text-foreground">
              No tracks found
            </p>
            <p className="mt-1 font-body text-sm text-muted-foreground">
              {selection.type === "explore"
                ? "Try another mood or genre, or connect Spotify if you haven't yet."
                : "This playlist may be empty or unavailable in your region."}
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <TrackListHeader />

            {tracks.map((track, index) => (
              <TrackListRow
                key={`${track.id}-${index}`}
                track={track}
                index={index}
                active={currentTrack?.id === track.id}
                isPlaying={isPlaying}
                onPlay={() => handlePlayTrack(track)}
              />
            ))}
          </div>
        )}

        {!loading && tracks.length > 0 && (
          <p className="mt-4 font-body text-xs text-muted-foreground">
            Tracks with previews play in Serenity. Full playback requires Spotify
            Premium with the Spotify app open.
          </p>
        )}
      </div>
    </div>
  );
}
