"use client";

import { useEffect, useState } from "react";
import {
  Play,
  Pause,
  Loader2,
  Music2,
  ExternalLink,
  Users,
} from "lucide-react";
import spotifyAPI from "@/lib/spotify";
import { usePlayer } from "@/contexts/PlayerContext";
import { Button } from "@/components/ui/button";
import { TrackListHeader, TrackListRow } from "@/components/TrackListRow";
import { StickyBackBar } from "@/components/StickyBackBar";

function formatFollowers(count) {
  if (!count) return "0 listeners";
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, "")}M followers`;
  }
  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(1).replace(/\.0$/, "")}K followers`;
  }
  return `${count.toLocaleString()} followers`;
}

function formatReleaseYear(dateString) {
  if (!dateString) return "";
  return dateString.slice(0, 4);
}

export function ArtistView({ artist, onBack, onSelectAlbum }) {
  const { playTrack, playQueue, currentTrack, isPlaying, togglePlayPause } =
    usePlayer();
  const [meta, setMeta] = useState(artist);
  const [topTracks, setTopTracks] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setMeta(artist);

      try {
        const [artistData, tracks, artistAlbums] = await Promise.all([
          spotifyAPI.getArtist(artist.id),
          spotifyAPI.getArtistTopTracks(artist.id, 10),
          spotifyAPI.getArtistAlbums(artist.id, 24),
        ]);

        if (cancelled) return;

        if (artistData) setMeta(artistData);
        setTopTracks(tracks);

        const seen = new Set();
        const uniqueAlbums = [];
        for (const album of artistAlbums) {
          if (seen.has(album.id)) continue;
          seen.add(album.id);
          uniqueAlbums.push(album);
        }
        setAlbums(uniqueAlbums);
      } catch (error) {
        console.error("Failed to load artist:", error);
        if (!cancelled) {
          setTopTracks([]);
          setAlbums([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [artist]);

  const image = meta?.images?.[0]?.url;
  const isPlayingFromArtist =
    currentTrack &&
    topTracks.some((t) => t.id === currentTrack.id) &&
    isPlaying;

  const handlePlayAll = () => {
    if (topTracks.length === 0) return;
    if (isPlayingFromArtist) {
      togglePlayPause();
    } else {
      playQueue(topTracks, 0);
    }
  };

  const handlePlayTrack = (track) => {
    if (currentTrack?.id === track.id) {
      togglePlayPause();
    } else {
      playTrack(track, topTracks);
    }
  };

  return (
    <div className="page-scroll ambient-glow">
      <StickyBackBar onBack={onBack} />
      <div className="page-content pb-10 pt-4">
        {/* Hero */}
        <div className="relative mb-8 overflow-hidden rounded-[28px]">
          <div
            className="absolute inset-0"
            style={{
              background: image
                ? `linear-gradient(to bottom, rgba(15,13,19,0.2) 0%, rgba(15,13,19,0.92) 70%), url(${image}) center/cover`
                : "linear-gradient(135deg, rgba(56,30,114,0.5) 0%, rgba(15,13,19,0.9) 100%)",
            }}
          />
          <div className="relative flex flex-col items-center gap-5 px-6 py-10 text-center sm:flex-row sm:items-end sm:text-left">
            {image ? (
              <img
                src={image}
                alt={meta?.name}
                className="h-40 w-40 shrink-0 rounded-full border-4 border-white/10 object-cover shadow-2xl sm:h-52 sm:w-52"
              />
            ) : (
              <div className="flex h-40 w-40 shrink-0 items-center justify-center rounded-full bg-m3-primary/30 sm:h-52 sm:w-52">
                <Music2 className="h-16 w-16 text-primary" />
              </div>
            )}

            <div className="min-w-0 flex-1 pb-1">
              <p className="font-display text-xs font-semibold uppercase tracking-widest text-white/70">
                Artist
              </p>
              <h1 className="font-display text-3xl font-extrabold text-white sm:text-5xl">
                {meta?.name || artist.name}
              </h1>
              {meta?.genres?.length > 0 && (
                <p className="mt-2 font-body text-sm capitalize text-white/75">
                  {meta.genres.slice(0, 3).join(" · ")}
                </p>
              )}
              <p className="mt-1 flex items-center justify-center gap-1.5 font-body text-sm text-white/60 sm:justify-start">
                <Users className="h-3.5 w-3.5" />
                {formatFollowers(meta?.followers)}
              </p>

              <div className="mt-5 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                <Button
                  onClick={handlePlayAll}
                  disabled={loading || topTracks.length === 0}
                  className="rounded-full bg-m3-primary px-8 font-display font-bold text-primary-foreground hover:bg-m3-primary/90"
                >
                  {isPlayingFromArtist ? (
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
            Loading artist…
          </div>
        ) : (
          <>
            {/* Popular tracks */}
            <div className="mb-8">
              <h2 className="mb-4 font-display text-xl font-bold text-foreground">
                Popular
              </h2>
              {topTracks.length === 0 ? (
                <div className="rounded-2xl border border-border bg-card py-12 text-center">
                  <p className="font-body text-sm text-muted-foreground">
                    No top tracks available for this artist.
                  </p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-border bg-card">
                  <TrackListHeader />

                  {topTracks.map((track, index) => (
                    <TrackListRow
                      key={track.id}
                      track={track}
                      index={index}
                      active={currentTrack?.id === track.id}
                      isPlaying={isPlaying}
                      onPlay={() => handlePlayTrack(track)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Discography */}
            {albums.length > 0 && (
              <div>
                <h2 className="mb-4 font-display text-xl font-bold text-foreground">
                  Discography
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {albums.map((album) => {
                    const cover = album.images?.[0]?.url;
                    return (
                      <button
                        key={album.id}
                        type="button"
                        onClick={() => onSelectAlbum?.(album)}
                        className="group rounded-2xl border border-border bg-card p-3 text-left transition-colors hover:border-primary/20 hover:bg-[var(--surface-container-high)]"
                      >
                        {cover ? (
                          <img
                            src={cover}
                            alt={album.name}
                            className="mb-3 aspect-square w-full rounded-xl object-cover shadow-md transition-transform group-hover:scale-[1.02]"
                          />
                        ) : (
                          <div className="mb-3 flex aspect-square w-full items-center justify-center rounded-xl bg-muted">
                            <Music2 className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                        <p className="truncate font-display text-sm font-semibold text-foreground">
                          {album.name}
                        </p>
                        <p className="mt-0.5 font-body text-xs capitalize text-muted-foreground">
                          {formatReleaseYear(album.release_date)} · {album.album_type}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
