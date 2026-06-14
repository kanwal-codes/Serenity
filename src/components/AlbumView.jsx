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
import { Button } from "@/components/ui/button";
import { TrackListHeader, TrackListRow } from "@/components/TrackListRow";
import { StickyBackBar } from "@/components/StickyBackBar";

function formatReleaseDate(dateString) {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-");
  if (day) {
    return new Date(Number(year), Number(month) - 1, Number(day)).toLocaleDateString(
      undefined,
      { year: "numeric", month: "short", day: "numeric" }
    );
  }
  if (month) {
    return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString(
      undefined,
      { year: "numeric", month: "long" }
    );
  }
  return year;
}

export function AlbumView({ album, onBack, onSelectArtist }) {
  const { playTrack, playQueue, currentTrack, isPlaying, togglePlayPause } =
    usePlayer();
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState(album);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setMeta(album);

      try {
        const { album: albumData, tracks: albumTracks } =
          await spotifyAPI.getAllAlbumTracks(album.id, 200);

        if (cancelled) return;

        if (albumData) setMeta(albumData);
        setTracks(albumTracks);
      } catch (error) {
        console.error("Failed to load album:", error);
        if (!cancelled) setTracks([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [album]);

  const cover = meta?.images?.[0]?.url;
  const totalTracks = meta?.total_tracks ?? tracks.length;
  const isPlayingFromThis =
    currentTrack && tracks.some((t) => t.id === currentTrack.id) && isPlaying;

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

  const albumTypeLabel =
    meta?.album_type === "single"
      ? "Single"
      : meta?.album_type === "compilation"
        ? "Compilation"
        : "Album";

  return (
    <div className="page-scroll ambient-glow">
      <StickyBackBar onBack={onBack} />
      <div className="page-content pb-10 pt-4">
        <div className="relative mb-8 overflow-hidden rounded-[28px]">
          <div
            className="absolute inset-0"
            style={{
              background: cover
                ? `linear-gradient(to bottom, rgba(15,13,19,0.15) 0%, rgba(15,13,19,0.92) 65%), url(${cover}) center/cover`
                : "linear-gradient(135deg, rgba(56,30,114,0.5) 0%, rgba(15,13,19,0.9) 100%)",
            }}
          />
          <div className="relative flex flex-col gap-6 px-6 py-8 sm:flex-row sm:items-end">
            {cover ? (
              <img
                src={cover}
                alt={meta?.name}
                className="h-44 w-44 shrink-0 rounded-2xl object-cover shadow-2xl sm:h-52 sm:w-52"
              />
            ) : (
              <div className="flex h-44 w-44 shrink-0 items-center justify-center rounded-2xl bg-m3-primary/30 sm:h-52 sm:w-52">
                <Music2 className="h-16 w-16 text-primary" />
              </div>
            )}

            <div className="min-w-0 flex-1 pb-1">
              <p className="font-display text-xs font-semibold uppercase tracking-widest text-white/70">
                {albumTypeLabel}
              </p>
              <h1 className="font-display text-3xl font-extrabold text-white sm:text-5xl">
                {meta?.name || album.name}
              </h1>
              {meta?.artists?.length > 0 && (
                <p className="mt-2 font-body text-sm text-white/80">
                  {meta.artists.map((artist, index) => (
                    <span key={artist.id}>
                      {index > 0 && ", "}
                      {onSelectArtist ? (
                        <button
                          type="button"
                          onClick={() => onSelectArtist(artist)}
                          className="border-none bg-transparent p-0 font-body text-sm text-white/80 transition-colors hover:text-white hover:underline"
                        >
                          {artist.name}
                        </button>
                      ) : (
                        artist.name
                      )}
                    </span>
                  ))}
                </p>
              )}
              <p className="mt-1 font-body text-sm text-white/60">
                {formatReleaseDate(meta?.release_date)}
                {totalTracks > 0 && ` · ${totalTracks} tracks`}
                {meta?.label && ` · ${meta.label}`}
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
                      Play
                    </>
                  )}
                </Button>
                {meta?.external_urls?.spotify && (
                  <a
                    href={meta.external_urls.spotify}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 font-body text-sm text-white/70 transition-colors hover:text-white"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open in Spotify
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
            Loading album…
          </div>
        ) : tracks.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card py-16 text-center">
            <Music2 className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <p className="font-display text-lg font-semibold text-foreground">
              No tracks found
            </p>
            <p className="mt-1 font-body text-sm text-muted-foreground">
              This album may be unavailable in your region.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <TrackListHeader showAlbum={false} />

            {tracks.map((track, index) => (
              <TrackListRow
                key={`${track.id}-${index}`}
                track={track}
                index={index}
                active={currentTrack?.id === track.id}
                isPlaying={isPlaying}
                onPlay={() => handlePlayTrack(track)}
                showAlbum={false}
                imageUrl={cover}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
