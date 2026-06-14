"use client";

import { useEffect, useMemo, useState } from "react";
import { Play, MoreHorizontal } from "lucide-react";
import { ALBUMS, ARTISTS, PLAYLISTS, RECENT_TRACKS } from "@/lib/musicData";
import { cn } from "@/lib/utils";
import { useSpotify } from "@/contexts/SpotifyContext";
import { usePlayer } from "@/contexts/PlayerContext";
import spotifyAPI from "@/lib/spotify";
import { TrackArtwork } from "@/components/TrackArtwork";

function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-4">
      <h2 className="font-display text-[22px] font-bold text-foreground">{title}</h2>
      {subtitle && (
        <p className="mt-0.5 font-body text-[13px] text-muted-foreground">{subtitle}</p>
      )}
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function dedupeTracksById(tracks, max = 6) {
  const seen = new Set();
  const unique = [];
  for (const track of tracks) {
    if (!track?.id || seen.has(track.id)) continue;
    seen.add(track.id);
    unique.push(track);
    if (unique.length >= max) break;
  }
  return unique;
}

function dedupeAlbumsFromTracks(tracks, max = 6) {
  const seen = new Set();
  const albums = [];
  for (const track of tracks) {
    const key = `${track.album}|${track.artist}`;
    if (!track.album || seen.has(key)) continue;
    seen.add(key);
    albums.push(track);
    if (albums.length >= max) break;
  }
  return albums;
}

function toQuickPick(track) {
  return {
    id: track.id,
    title: track.title ?? track.name,
    artist: track.artist,
    album: track.album,
    duration:
      track.duration ??
      track.duration_formatted ??
      (track.duration_ms != null
        ? spotifyAPI.formatDuration(track.duration_ms)
        : undefined),
    cover: track.cover ?? track.images?.[0]?.url,
    preview_url: track.preview_url,
    uri: track.uri,
    external_urls: track.external_urls,
    images: track.images,
  };
}

function toPlayerTrack(track) {
  return {
    id: track.id,
    name: track.title ?? track.name,
    artist: track.artist,
    album: track.album,
    duration_formatted: track.duration ?? track.duration_formatted,
    duration_ms: track.duration_ms,
    images: track.cover ? [{ url: track.cover }] : track.images,
    preview_url: track.preview_url,
    uri: track.uri,
    external_urls: track.external_urls,
  };
}

function fromSpotifyTrack(track) {
  return toQuickPick(track);
}

function AlbumCard({ album, onPlay, currentTrackId }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="group min-w-0 cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onPlay(album.tracks[0])}
    >
      <div className="relative overflow-hidden rounded-2xl">
        <img
          src={album.cover}
          alt={album.title}
          className="block aspect-square w-full object-cover transition-transform duration-300"
          style={{ transform: hovered ? "scale(1.06)" : "scale(1)" }}
        />
        <div
          className="absolute inset-0 flex items-end justify-between p-3 transition-opacity duration-250"
          style={{
            background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)",
            opacity: hovered ? 1 : 0,
          }}
        >
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-m3-primary active:scale-90"
            onClick={(e) => {
              e.stopPropagation();
              onPlay(album.tracks[0]);
            }}
          >
            <Play className="ml-0.5 h-[22px] w-[22px] text-primary-foreground" />
          </button>
          <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-white/15">
            <MoreHorizontal className="h-[18px] w-[18px] text-white" />
          </div>
        </div>
      </div>
      <div className="mt-2 px-1">
        <p className="truncate font-display text-[13px] font-semibold text-foreground">
          {album.title}
        </p>
        <p className="truncate font-body text-xs text-muted-foreground">
          {album.artist} · {album.year}
        </p>
      </div>
    </div>
  );
}

function SpotifyAlbumCard({ track, onPlay, isActive }) {
  const [hovered, setHovered] = useState(false);
  const cover = track.cover ?? track.images?.[0]?.url;

  return (
    <div
      className="group min-w-0 cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onPlay(track)}
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl",
          isActive && "ring-2 ring-primary ring-offset-2 ring-offset-background"
        )}
      >
        {cover ? (
          <img
            src={cover}
            alt={track.album}
            className="block aspect-square w-full object-cover transition-transform duration-300"
            style={{ transform: hovered ? "scale(1.06)" : "scale(1)" }}
          />
        ) : (
          <div className="flex aspect-square w-full items-center justify-center bg-muted">
            <Play className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
        <div
          className="absolute inset-0 flex items-end p-3 transition-opacity duration-250"
          style={{
            background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)",
            opacity: hovered ? 1 : 0,
          }}
        >
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-m3-primary active:scale-90"
            onClick={(e) => {
              e.stopPropagation();
              onPlay(track);
            }}
          >
            <Play className="ml-0.5 h-[22px] w-[22px] text-primary-foreground" />
          </button>
        </div>
      </div>
      <div className="mt-2 px-1">
        <p className="truncate font-display text-[13px] font-semibold text-foreground">
          {track.album}
        </p>
        <p className="truncate font-body text-xs text-muted-foreground">{track.artist}</p>
      </div>
    </div>
  );
}

function TrackGrid({ tracks, onPlayTrack, currentTrackId, isPlaying }) {
  const playerQueue = tracks.map(toPlayerTrack);

  return (
    <div
      className="grid gap-4"
      style={{ gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))" }}
    >
      {tracks.map((track) => {
        const isActive = currentTrackId === track.id;
        const cover = track.cover ?? track.images?.[0]?.url;
        return (
          <button
            key={track.id}
            type="button"
            onClick={() => onPlayTrack(toPlayerTrack(track), playerQueue)}
            className={cn(
              "track-row group/track cursor-pointer rounded-2xl border border-transparent bg-card p-3 text-left",
              isActive && "track-row-active border-primary/30 bg-primary/10"
            )}
          >
            <TrackArtwork
              src={cover}
              alt={track.title}
              size="lg"
              isActive={isActive}
              isPlaying={isPlaying}
              className="mb-3"
            />
            <p
              className={cn(
                "truncate font-display text-[13px] font-semibold",
                isActive ? "text-primary" : "text-foreground"
              )}
            >
              {track.title}
            </p>
            <p className="truncate font-body text-xs text-muted-foreground">{track.artist}</p>
          </button>
        );
      })}
    </div>
  );
}

function QuickPickRows({ tracks, onPlayTrack, currentTrackId, isPlaying }) {
  const playerQueue = tracks.map(toPlayerTrack);

  return (
    <div className="grid grid-cols-2 gap-2">
      {tracks.map((track) => {
        const isActive = currentTrackId === track.id;
        return (
          <button
            key={track.id}
            type="button"
            onClick={() => onPlayTrack(toPlayerTrack(track), playerQueue)}
            className={cn(
              "track-row group/track flex w-full cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left",
              isActive
                ? "track-row-active border-primary/30 bg-primary/10"
                : "border-transparent bg-card"
            )}
          >
            <TrackArtwork
              src={track.cover}
              alt={track.title}
              size="md"
              isActive={isActive}
              isPlaying={isPlaying}
            />
            <div className="min-w-0 flex-1 overflow-hidden">
              <p
                className={cn(
                  "truncate font-display text-[13px] font-semibold",
                  isActive ? "text-primary" : "text-foreground"
                )}
              >
                {track.title}
              </p>
              <p className="truncate font-body text-xs text-muted-foreground">{track.artist}</p>
            </div>
            <span className="shrink-0 font-body text-xs text-muted-foreground">
              {track.duration}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function HomeLoading() {
  return (
    <div className="space-y-8">
      <div className="skeleton-shimmer h-[220px] rounded-[28px]" />
      <div>
        <div className="skeleton-shimmer mb-4 h-6 w-40 rounded-lg" />
        <div className="grid grid-cols-2 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton-shimmer h-16 rounded-xl" />
          ))}
        </div>
      </div>
      <div>
        <div className="skeleton-shimmer mb-4 h-6 w-48 rounded-lg" />
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="skeleton-shimmer aspect-square rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function SpotifyHome({ onSelectArtist }) {
  const featuredAlbum = ALBUMS[0];
  const featuredTrack = featuredAlbum.tracks[0];
  const { isConnected, loading: spotifyLoading, profile } = useSpotify();
  const { playTrack, playQueue, currentTrack, isPlaying } = usePlayer();
  const currentTrackId = currentTrack?.id;

  const [homeLoading, setHomeLoading] = useState(false);
  const [personalized, setPersonalized] = useState(null);
  const [quickPicks, setQuickPicks] = useState(() =>
    dedupeTracksById(RECENT_TRACKS).map(toQuickPick)
  );

  useEffect(() => {
    if (!isConnected) {
      setPersonalized(null);
      setQuickPicks(dedupeTracksById(RECENT_TRACKS).map(toQuickPick));
      return;
    }

    let cancelled = false;
    setHomeLoading(true);

    (async () => {
      const [
        recentlyPlayed,
        topTracksShort,
        topTracksMedium,
        topArtists,
        savedTracksResult,
      ] = await Promise.all([
        spotifyAPI.getRecentlyPlayed(20),
        spotifyAPI.getTopTracks("short_term", 12),
        spotifyAPI.getTopTracks("medium_term", 10),
        spotifyAPI.getTopArtists("medium_term", 8),
        spotifyAPI.getSavedTracks(12, 0),
      ]);

      if (cancelled) return;

      const recentUnique = dedupeTracksById(recentlyPlayed, 6).map(fromSpotifyTrack);
      const topShort = dedupeTracksById(topTracksShort, 6).map(fromSpotifyTrack);
      const topMedium = dedupeTracksById(topTracksMedium, 10).map(fromSpotifyTrack);
      const saved = dedupeTracksById(savedTracksResult.items, 6).map(fromSpotifyTrack);
      const rotationAlbums = dedupeAlbumsFromTracks(recentlyPlayed, 6).map(fromSpotifyTrack);

      const seedArtists = topArtists.slice(0, 2).map((a) => a.id);
      const seedTracks = topTracksMedium.slice(0, 3).map((t) => t.id);
      const seedGenres = [
        ...new Set(topArtists.flatMap((a) => a.genres ?? [])),
      ].slice(0, 2);
      let recommended = await spotifyAPI.getRecommendations({
        seedArtists,
        seedTracks,
        seedGenres,
        limit: 12,
      });
      if (cancelled) return;

      recommended = dedupeTracksById(recommended, 6).map(fromSpotifyTrack);

      const heroTrack =
        recentUnique[0] ?? topShort[0] ?? topMedium[0] ?? null;

      setQuickPicks(recentUnique.length > 0 ? recentUnique : topShort);
      setPersonalized({
        heroTrack,
        topTracks: topShort,
        topArtists,
        recommended,
        rotationAlbums,
        savedTracks: saved,
        topArtistName: topArtists[0]?.name,
      });
      setHomeLoading(false);
    })().catch((error) => {
      console.error("Failed to load personalized home:", error);
      if (!cancelled) setHomeLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [isConnected]);

  const greeting = useMemo(() => getGreeting(), []);
  const firstName = profile?.display_name?.split(" ")[0];

  const handlePlayTrack = (track, queue) => {
    if (queue?.length) {
      playTrack(track, queue);
    } else {
      playTrack(track);
    }
  };

  if (isConnected && (spotifyLoading || homeLoading)) {
    return (
      <div className="page-scroll ambient-glow">
        <div className="page-content">
          <HomeLoading />
        </div>
      </div>
    );
  }

  if (isConnected && personalized) {
    const { heroTrack, topTracks, topArtists, recommended, rotationAlbums, savedTracks, topArtistName } =
      personalized;
    const heroCover = heroTrack?.cover;
    const heroQueue = topTracks.map(toPlayerTrack);

    return (
      <div className="page-scroll ambient-glow">
        <div className="page-content">
          {/* Personalized hero */}
          <div className="relative mb-8 min-h-[220px] overflow-hidden rounded-[28px]">
            {heroCover ? (
              <img
                src={heroCover}
                alt=""
                className="h-[220px] w-full object-cover"
              />
            ) : (
              <div className="h-[220px] w-full bg-gradient-to-br from-primary/40 to-[var(--m3-tertiary)]/30" />
            )}
            <div
              className="absolute inset-0 flex flex-col justify-end p-8"
              style={{
                background:
                  "linear-gradient(135deg, rgba(56,30,114,0.88) 0%, rgba(15,13,19,0.55) 100%)",
              }}
            >
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="font-display text-sm font-semibold text-white/80">
                    {greeting}
                    {firstName ? `, ${firstName}` : ""}
                  </p>
                  <h1 className="mt-1 font-display text-[28px] font-extrabold leading-tight text-white sm:text-[32px]">
                    {heroTrack ? heroTrack.title : "Your mix"}
                  </h1>
                  <p className="mt-1.5 font-body text-base text-white/75">
                    {heroTrack
                      ? `${heroTrack.artist}${topArtistName ? ` · Inspired by ${topArtistName}` : ""}`
                      : "Built from your listening history"}
                  </p>
                </div>
                {heroTrack && (
                  <button
                    type="button"
                    onClick={() =>
                      topTracks.length > 0
                        ? playQueue(
                            heroQueue,
                            heroQueue.findIndex((t) => t.id === heroTrack.id)
                          )
                        : handlePlayTrack(toPlayerTrack(heroTrack))
                    }
                    className="flex shrink-0 cursor-pointer items-center gap-2 rounded-full border-none bg-m3-primary px-7 py-3 font-display text-[15px] font-bold text-primary-foreground outline-none active:scale-95"
                  >
                    <Play className="h-[22px] w-[22px]" />
                    Play
                  </button>
                )}
              </div>
            </div>
          </div>

          {quickPicks.length > 0 && (
            <div className="mb-8">
              <SectionHeader
                title="Jump back in"
                subtitle="Pick up where you left off"
              />
              <QuickPickRows
                tracks={quickPicks}
                onPlayTrack={handlePlayTrack}
                currentTrackId={currentTrackId}
                isPlaying={isPlaying}
              />
            </div>
          )}

          {topTracks.length > 0 && (
            <div className="mb-8">
              <SectionHeader
                title="Your top tracks"
                subtitle="Most played this month"
              />
              <TrackGrid
                tracks={topTracks}
                onPlayTrack={handlePlayTrack}
                currentTrackId={currentTrackId}
                isPlaying={isPlaying}
              />
            </div>
          )}

          {topArtists.length > 0 && (
            <div className="mb-8">
              <SectionHeader
                title="Your artists"
                subtitle="Who you're listening to most"
              />
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
                {topArtists.map((artist) => {
                  const inner = (
                    <>
                      {artist.images?.[0]?.url ? (
                        <img
                          src={artist.images[0].url}
                          alt={artist.name}
                          className="h-[88px] w-[88px] rounded-full border-2 border-border object-cover transition-colors group-hover:border-primary/40"
                        />
                      ) : (
                        <div className="flex h-[88px] w-[88px] items-center justify-center rounded-full border-2 border-border bg-muted font-display text-xl font-bold text-muted-foreground">
                          {artist.name[0]}
                        </div>
                      )}
                      <p className="w-full truncate text-center font-display text-[13px] font-semibold text-foreground">
                        {artist.name}
                      </p>
                      <p className="line-clamp-2 text-center font-body text-[11px] text-muted-foreground">
                        {artist.genres?.[0] ?? "Artist"}
                      </p>
                    </>
                  );

                  if (onSelectArtist) {
                    return (
                      <button
                        key={artist.id}
                        type="button"
                        onClick={() => onSelectArtist(artist)}
                        className="chip-tap group flex w-[110px] shrink-0 flex-col items-center gap-2 border-none bg-transparent p-0"
                      >
                        {inner}
                      </button>
                    );
                  }

                  return (
                    <div
                      key={artist.id}
                      className="flex w-[110px] shrink-0 flex-col items-center gap-2"
                    >
                      {inner}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {recommended.length > 0 && (
            <div className="mb-8">
              <SectionHeader
                title={
                  topArtistName
                    ? `Because you listen to ${topArtistName}`
                    : "Recommended for you"
                }
                subtitle="Fresh picks based on your taste"
              />
              <TrackGrid
                tracks={recommended}
                onPlayTrack={handlePlayTrack}
                currentTrackId={currentTrackId}
                isPlaying={isPlaying}
              />
            </div>
          )}

          {rotationAlbums.length > 0 && (
            <div className="mb-8">
              <SectionHeader
                title="On repeat"
                subtitle="Albums from your recent rotation"
              />
              <div
                className="grid gap-4"
                style={{ gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" }}
              >
                {rotationAlbums.map((track) => (
                  <SpotifyAlbumCard
                    key={`${track.album}-${track.artist}`}
                    track={track}
                    isActive={currentTrackId === track.id}
                    onPlay={(t) => handlePlayTrack(toPlayerTrack(t))}
                  />
                ))}
              </div>
            </div>
          )}

          {savedTracks.length > 0 && (
            <div className="mb-4">
              <SectionHeader
                title="From your library"
                subtitle="Tracks you've saved on Spotify"
              />
              <QuickPickRows
                tracks={savedTracks}
                onPlayTrack={handlePlayTrack}
                currentTrackId={currentTrackId}
                isPlaying={isPlaying}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  /* Fallback — not connected to Spotify */
  return (
    <div className="page-scroll">
      <div className="page-content">
        <div className="relative mb-8 min-h-[220px] overflow-hidden rounded-[28px]">
          <img
            src="https://images.unsplash.com/photo-1618172842918-3eabce30c912?w=1200&h=400&fit=crop&auto=format"
            alt="Featured music"
            className="h-[220px] w-full object-cover"
          />
          <div
            className="absolute inset-0 flex flex-col justify-end p-8"
            style={{
              background:
                "linear-gradient(135deg, rgba(56,30,114,0.85) 0%, rgba(15,13,19,0.6) 100%)",
            }}
          >
            <div className="flex items-end justify-between">
              <div>
                <span className="mb-3 inline-block rounded-[20px] bg-m3-primary px-3 py-1 font-display text-[11px] font-bold uppercase tracking-widest text-primary-foreground">
                  Connect Spotify
                </span>
                <h1 className="font-display text-[32px] font-extrabold leading-tight text-white">
                  {featuredAlbum.title}
                </h1>
                <p className="mt-1.5 font-body text-base text-white/75">
                  Connect Spotify in the sidebar for a personalized home feed
                </p>
              </div>
              <button
                type="button"
                onClick={() => playTrack(featuredTrack)}
                className="flex cursor-pointer items-center gap-2 rounded-full border-none bg-m3-primary px-7 py-3 font-display text-[15px] font-bold text-primary-foreground outline-none active:scale-95"
              >
                <Play className="h-[22px] w-[22px]" />
                Play Now
              </button>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <SectionHeader title="Quick Picks" subtitle="Sample tracks — connect Spotify to personalize" />
          <QuickPickRows
            tracks={quickPicks}
            onPlayTrack={handlePlayTrack}
            currentTrackId={currentTrackId}
            isPlaying={isPlaying}
          />
        </div>

        <div className="mb-8">
          <SectionHeader title="New Albums" />
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" }}
          >
            {ALBUMS.slice(0, 6).map((album) => (
              <AlbumCard
                key={album.id}
                album={album}
                onPlay={(track) => playTrack(track)}
                currentTrackId={currentTrackId}
                isPlaying={isPlaying}
              />
            ))}
          </div>
        </div>

        <div className="mb-8">
          <SectionHeader title="Featured Artists" />
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
            {ARTISTS.map((artist) => (
              <div
                key={artist.id}
                className="flex w-[110px] shrink-0 cursor-pointer flex-col items-center gap-2"
              >
                <img
                  src={artist.photo}
                  alt={artist.name}
                  className="h-[88px] w-[88px] rounded-full border-2 border-border object-cover"
                />
                <p className="w-full truncate text-center font-display text-[13px] font-semibold text-foreground">
                  {artist.name}
                </p>
                <p className="text-center font-body text-[11px] text-muted-foreground">
                  {artist.genre}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <SectionHeader title="Your Playlists" />
          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}
          >
            {PLAYLISTS.map((pl) => (
              <div
                key={pl.id}
                className="card-hover flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-3"
              >
                <img
                  src={pl.cover}
                  alt={pl.title}
                  className="h-14 w-14 shrink-0 rounded-xl object-cover"
                />
                <div className="min-w-0 overflow-hidden">
                  <p className="truncate font-display text-sm font-semibold text-foreground">
                    {pl.title}
                  </p>
                  <p className="font-body text-xs text-muted-foreground">
                    {pl.trackCount} tracks
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <SectionHeader title="Recommended for You" />
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" }}
          >
            {ALBUMS.slice(4).map((album) => (
              <AlbumCard
                key={album.id}
                album={album}
                onPlay={(track) => playTrack(track)}
                currentTrackId={currentTrackId}
                isPlaying={isPlaying}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
