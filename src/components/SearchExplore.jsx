"use client";

import { useCallback, useMemo, useEffect, useState } from "react";
import {
  Search,
  Play,
  ExternalLink,
  Music2,
  LogIn,
  Loader2,
  Compass,
  Sparkles,
  Disc3,
} from "lucide-react";
import spotifyAPI from "@/lib/spotify";
import { EXPLORE_MOODS, SEARCH_GENRES } from "@/lib/musicData";
import { useSpotify } from "@/contexts/SpotifyContext";
import { usePlayer } from "@/contexts/PlayerContext";
import { useSpotifyTaste } from "@/hooks/useSpotifyTaste";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { TrackListHeader, TrackListRow } from "@/components/TrackListRow";

const POPULAR_TERMS = [
  "Bohemian Rhapsody",
  "Blinding Lights",
  "Arjan Dhillon",
  "Levitating",
  "Shape of You",
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function SectionDivider({ icon: Icon, title, subtitle }) {
  return (
    <div className="relative my-10">
      <div className="absolute inset-0 flex items-center" aria-hidden>
        <div className="w-full border-t border-border" />
      </div>
      <div className="relative flex justify-center">
        <div className="glass-panel flex items-center gap-2 rounded-full px-4 py-1.5 shadow-sm">
          <Icon className="h-4 w-4 text-primary" />
          <span className="font-display text-xs font-bold uppercase tracking-widest text-primary">
            {title}
          </span>
        </div>
      </div>
      {subtitle && (
        <p className="mt-3 text-center font-body text-sm text-muted-foreground">{subtitle}</p>
      )}
    </div>
  );
}

function ExploreSection({
  isConnected,
  profileName,
  topGenres,
  playlists,
  onSelectLibrary,
  onSelectAlbum,
  onSelectExplore,
}) {
  const [featuredPlaylists, setFeaturedPlaylists] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [exploreLoading, setExploreLoading] = useState(false);

  const personalizedGenres = useMemo(() => {
    const staticLabels = new Set(SEARCH_GENRES.map((g) => g.label.toLowerCase()));
    const fromTaste = (topGenres ?? [])
      .filter((g) => !staticLabels.has(g.toLowerCase()))
      .slice(0, 4)
      .map((label, i) => ({
        label,
        color: ["#D0BCFF", "#80CBAD", "#EFB8C8", "#AECBFA"][i % 4],
        bg: `rgba(208,188,255,${0.08 + i * 0.02})`,
        personal: true,
      }));
    return [...fromTaste, ...SEARCH_GENRES.map((g) => ({ ...g, personal: false }))];
  }, [topGenres]);

  const exploreSubtitle = profileName
    ? topGenres?.[0]
      ? `Curated for ${profileName} — leaning ${topGenres[0]}`
      : `Curated for ${profileName}`
    : "Moods, genres, and fresh music to discover";

  useEffect(() => {
    if (!isConnected) return;

    let cancelled = false;
    setExploreLoading(true);

    Promise.all([
      spotifyAPI.getFeaturedPlaylists(10),
      spotifyAPI.getNewReleases(8),
    ])
      .then(([featured, releases]) => {
        if (cancelled) return;
        setFeaturedPlaylists(featured);
        setNewReleases(releases);
      })
      .catch((error) => console.error("Explore load error:", error))
      .finally(() => {
        if (!cancelled) setExploreLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isConnected]);

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <section aria-label="Explore">
      <SectionDivider icon={Compass} title="Explore" subtitle={exploreSubtitle} />

      <div className="mb-8">
        <h2 className="mb-1 font-display text-lg font-bold text-foreground">Moods & moments</h2>
        <p className="mb-4 font-body text-sm text-muted-foreground">
          Tap a vibe to open a curated track list
        </p>
        <div className="grid grid-cols-3 gap-3">
          {EXPLORE_MOODS.map((mood) => (
            <button
              key={mood.label}
              type="button"
              onClick={() =>
                onSelectExplore?.({
                  type: "explore",
                  exploreKind: "mood",
                  name: mood.label,
                  description: mood.sub,
                  query: `${mood.label} ${mood.sub}`,
                  images: [{ url: mood.img }],
                })
              }
              className="chip-tap relative h-[120px] overflow-hidden rounded-2xl ring-1 ring-white/5 outline-none hover:ring-primary/30 sm:h-[130px]"
              style={{ gridColumn: `span ${mood.span}` }}
            >
              <img src={mood.img} alt="" className="h-full w-full object-cover" />
              <div
                className="absolute inset-0 flex flex-col justify-end p-4 text-left"
                style={{
                  background: `linear-gradient(to top, rgba(0,0,0,0.78) 0%, ${mood.tint} 45%, transparent 100%)`,
                }}
              >
                <p className="font-display text-base font-bold" style={{ color: mood.accent }}>
                  {mood.label}
                </p>
                <p className="font-body text-xs text-white/70">{mood.sub}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="mb-1 font-display text-lg font-bold text-foreground">
          {topGenres?.length ? "Your genres & more" : "Browse genres"}
        </h2>
        <p className="mb-4 font-body text-sm text-muted-foreground">
          {topGenres?.length
            ? "From your listening taste — opens as a track list"
            : "Quick picks by genre"}
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {personalizedGenres.slice(0, 12).map((genre) => (
            <button
              key={genre.label}
              type="button"
              onClick={() =>
                onSelectExplore?.({
                  type: "explore",
                  exploreKind: "genre",
                  name: genre.label,
                  description: genre.personal
                    ? `Personalized ${genre.label} picks for you`
                    : `Popular ${genre.label} tracks`,
                  query: `${genre.label} music`,
                  accentColor: genre.color,
                  accentBg: genre.bg,
                })
              }
              className={cn(
                "chip-tap flex h-14 items-center rounded-xl border px-4 font-display text-sm font-semibold",
                genre.personal ? "border-primary/25" : "border-border"
              )}
              style={{ background: genre.bg, color: genre.color }}
            >
              {genre.personal && (
                <Sparkles className="mr-1.5 h-3.5 w-3.5 shrink-0 opacity-80" />
              )}
              <span className="truncate">{genre.label}</span>
            </button>
          ))}
        </div>
      </div>

      {isConnected && playlists.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 font-display text-lg font-bold text-foreground">Your playlists</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            {playlists.slice(0, 10).map((playlist) => {
              const cover = playlist.images?.[0]?.url;
              return (
                <button
                  key={playlist.id}
                  type="button"
                  onClick={() =>
                    onSelectLibrary?.({
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
                  className="chip-tap group w-[168px] shrink-0 rounded-2xl border border-border bg-card p-3 text-left hover:border-primary/20 hover:bg-[var(--surface-container-high)]"
                >
                  {cover ? (
                    <img
                      src={cover}
                      alt={playlist.name}
                      className="mb-3 aspect-square w-full rounded-xl object-cover shadow-md"
                    />
                  ) : (
                    <div className="mb-3 flex aspect-square w-full items-center justify-center rounded-xl bg-muted">
                      <Music2 className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <p className="line-clamp-2 font-display text-sm font-semibold text-foreground">
                    {playlist.name}
                  </p>
                  <p className="mt-0.5 font-body text-xs text-muted-foreground">
                    {playlist.tracks?.total ?? 0} tracks
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {!isConnected && (
        <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-6 text-center">
          <Sparkles className="mx-auto mb-2 h-8 w-8 text-primary" />
          <p className="font-display text-sm font-semibold text-foreground">
            Connect Spotify to unlock your playlists, featured picks & new releases
          </p>
        </div>
      )}

      {isConnected && exploreLoading && (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Loading explore…
        </div>
      )}

      {isConnected && !exploreLoading && featuredPlaylists.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 font-display text-lg font-bold text-foreground">
            Featured for you
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            {featuredPlaylists.map((playlist) => {
              const cover = playlist.images?.[0]?.url;
              return (
                <button
                  key={playlist.id}
                  type="button"
                  onClick={() =>
                    onSelectLibrary?.({
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
                  className="chip-tap group w-[168px] shrink-0 rounded-2xl border border-border bg-card p-3 text-left hover:border-primary/20 hover:bg-[var(--surface-container-high)]"
                >
                  {cover ? (
                    <img
                      src={cover}
                      alt={playlist.name}
                      className="mb-3 aspect-square w-full rounded-xl object-cover shadow-md"
                    />
                  ) : (
                    <div className="mb-3 flex aspect-square w-full items-center justify-center rounded-xl bg-muted">
                      <Music2 className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <p className="line-clamp-2 font-display text-sm font-semibold text-foreground">
                    {playlist.name}
                  </p>
                  <p className="mt-0.5 truncate font-body text-xs text-muted-foreground">
                    {playlist.owner?.display_name ?? "Spotify"}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {isConnected && !exploreLoading && newReleases.length > 0 && (
        <div className="mb-4">
          <h2 className="mb-4 font-display text-lg font-bold text-foreground">New releases</h2>
          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}
          >
            {newReleases.map((album) => {
              const cover = album.images?.[0]?.url;
              return (
                <button
                  key={album.id}
                  type="button"
                  onClick={() => onSelectAlbum?.(album)}
                  className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left transition-colors hover:border-primary/15 hover:bg-[var(--surface-container-high)]"
                >
                  {cover ? (
                    <img
                      src={cover}
                      alt={album.name}
                      className="h-16 w-16 shrink-0 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-muted">
                      <Disc3 className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-sm font-semibold text-foreground">
                      {album.name}
                    </p>
                    <p className="truncate font-body text-xs text-muted-foreground">
                      {album.artists?.join(", ")}
                    </p>
                    <p className="mt-0.5 font-body text-[11px] text-muted-foreground">
                      {formatDate(album.release_date)} · {album.total_tracks} tracks
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

export function SearchExplore({
  onSelectLibrary,
  onSelectArtist,
  onSelectAlbum,
  onSelectExplore,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [artistResults, setArtistResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { isConnected, connect, profile, playlists } = useSpotify();
  const { taste, loading: tasteLoading } = useSpotifyTaste(isConnected);
  const { playTrack, currentTrack, isPlaying, togglePlayPause } = usePlayer();

  const firstName = profile?.display_name?.split(" ")[0];
  const greeting = useMemo(() => getGreeting(), []);

  const handleSearch = useCallback(async (query) => {
    const trimmed = query.trim();
    if (!trimmed) return;

    setSearchQuery(trimmed);
    setLoading(true);
    setHasSearched(true);

    try {
      const token = await spotifyAPI.getAccessToken();
      if (token) {
        const [tracks, artists] = await Promise.all([
          spotifyAPI.searchTracks(trimmed, 25),
          spotifyAPI.searchArtists(trimmed, 8),
        ]);
        setSearchResults(tracks);
        setArtistResults(artists);
      } else {
        setSearchResults([]);
        setArtistResults([]);
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
      setArtistResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handlePlay = async (song, queue) => {
    if (currentTrack?.id === song.id) {
      togglePlayPause();
      return;
    }
    await playTrack(song, queue ?? searchResults);
  };

  const formatDuration = (ms) => {
    if (!ms) return "0:00";
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="page-scroll ambient-glow">
      <div className="page-content relative pb-10">
        {/* Personalized welcome */}
        <div className="glass-panel relative mb-6 overflow-hidden rounded-3xl p-5 sm:p-6">
          <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-primary/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-8 left-1/4 h-28 w-28 rounded-full bg-[var(--m3-teal)]/10 blur-2xl" />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              {profile?.images?.[0]?.url ? (
                <img
                  src={profile.images[0].url}
                  alt={profile.display_name ?? "You"}
                  className="h-14 w-14 shrink-0 rounded-full border-2 border-primary/30 object-cover shadow-lg"
                />
              ) : (
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-m3-primary font-display text-xl font-bold text-primary-foreground">
                  {firstName?.[0]?.toUpperCase() ?? "S"}
                </div>
              )}
              <div>
                <p className="font-body text-sm text-muted-foreground">
                  {greeting}
                  {firstName ? `, ${firstName}` : ""}
                </p>
                <h1 className="font-display text-[26px] font-extrabold leading-tight text-foreground sm:text-[28px]">
                  Search & Explore
                </h1>
                <p className="mt-0.5 font-body text-sm text-muted-foreground">
                  {isConnected && taste?.topGenres?.[0]
                    ? `Tuned to ${taste.topGenres[0]} and your library`
                    : "Find tracks, moods, and new music"}
                </p>
              </div>
            </div>
          </div>

          <form
            className="relative mt-5 flex gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch(searchQuery);
            }}
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                placeholder={
                  taste?.topArtists?.[0]
                    ? `Try "${taste.topArtists[0].name}" or any song…`
                    : "What do you want to listen to?"
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input h-12 w-full rounded-full border border-border bg-[var(--surface-container-high)] pl-12 pr-4 font-body text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <Button
              type="submit"
              disabled={loading || !searchQuery.trim()}
              className="h-12 rounded-full bg-m3-primary px-6 font-display font-semibold text-primary-foreground hover:bg-m3-primary/90"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Search
                </>
              ) : (
                "Search"
              )}
            </Button>
          </form>

          {!isConnected && (
            <div className="relative mt-4 flex items-center justify-between gap-3 rounded-2xl border border-border bg-background/50 px-4 py-3">
              <p className="font-body text-xs text-muted-foreground sm:text-sm">
                Connect Spotify for personalized search & explore
              </p>
              <Button
                onClick={connect}
                size="sm"
                className="shrink-0 rounded-full bg-[var(--spotify-green)] text-white hover:bg-[var(--spotify-green)]/90"
              >
                <LogIn className="mr-1.5 h-3.5 w-3.5" />
                Connect
              </Button>
            </div>
          )}
        </div>

        {/* Your artists */}
        {isConnected && !tasteLoading && taste?.topArtists?.length > 0 && !hasSearched && (
          <div className="mb-6">
            <h2 className="mb-3 font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Your artists
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-1 scrollbar-none">
              {taste.topArtists.map((artist) => (
                <button
                  key={artist.id}
                  type="button"
                  onClick={() =>
                    onSelectArtist
                      ? onSelectArtist(artist)
                      : handleSearch(artist.name)
                  }
                  className="chip-tap flex w-[88px] shrink-0 flex-col items-center gap-2"
                >
                  {artist.images?.[0]?.url ? (
                    <img
                      src={artist.images[0].url}
                      alt={artist.name}
                      className="h-[72px] w-[72px] rounded-full border-2 border-border object-cover transition-colors hover:border-primary/40"
                    />
                  ) : (
                    <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full border-2 border-border bg-muted font-display text-lg font-bold text-muted-foreground">
                      {artist.name[0]}
                    </div>
                  )}
                  <span className="w-full truncate text-center font-display text-[11px] font-semibold text-foreground">
                    {artist.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {!isConnected && !hasSearched && searchResults.length === 0 && (
          <div className="mb-2">
            <h2 className="mb-3 font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Popular searches
            </h2>
            <div className="flex flex-wrap gap-2">
              {POPULAR_TERMS.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => {
                    setSearchQuery(term);
                    handleSearch(term);
                  }}
                  className="chip-tap rounded-full border border-border bg-[var(--surface-container-high)] px-4 py-2 font-body text-sm text-foreground hover:border-primary/30 hover:bg-primary/10"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
            Searching Spotify…
          </div>
        )}

        {!loading && artistResults.length > 0 && (
          <div className="mb-6">
            <p className="mb-3 font-display text-sm font-semibold text-muted-foreground">
              Artists
            </p>
            <div className="flex gap-4 overflow-x-auto pb-1 scrollbar-none">
              {artistResults.map((artist) => (
                <button
                  key={artist.id}
                  type="button"
                  onClick={() => onSelectArtist?.(artist)}
                  className="chip-tap flex w-[100px] shrink-0 flex-col items-center gap-2 border-none bg-transparent p-0"
                >
                  {artist.images?.[0]?.url ? (
                    <img
                      src={artist.images[0].url}
                      alt={artist.name}
                      className="h-20 w-20 rounded-full border-2 border-border object-cover transition-colors hover:border-primary/40"
                    />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-border bg-muted font-display text-lg font-bold text-muted-foreground">
                      {artist.name[0]}
                    </div>
                  )}
                  <span className="w-full truncate text-center font-display text-xs font-semibold text-foreground">
                    {artist.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {!loading && searchResults.length > 0 && (
          <div className="mb-2">
            <p className="mb-3 font-display text-sm font-semibold text-muted-foreground">
              Songs
            </p>
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <TrackListHeader />

              {searchResults.map((song, index) => (
                <TrackListRow
                  key={song.id}
                  track={{
                    ...song,
                    duration_formatted:
                      song.duration_formatted || formatDuration(song.duration_ms),
                  }}
                  index={index}
                  active={currentTrack?.id === song.id}
                  isPlaying={isPlaying}
                  onPlay={() => handlePlay(song)}
                />
              ))}
            </div>
          </div>
        )}

        {!loading && hasSearched && searchResults.length === 0 && artistResults.length === 0 && (
          <div className="mb-2 rounded-2xl border border-border bg-card py-12 text-center">
            <Music2 className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <p className="font-display text-lg font-semibold text-foreground">
              No results for &ldquo;{searchQuery}&rdquo;
            </p>
            <p className="mt-1 font-body text-sm text-muted-foreground">
              Try a mood or genre below, or search again.
            </p>
          </div>
        )}

        <ExploreSection
          isConnected={isConnected}
          profileName={firstName}
          topGenres={taste?.topGenres}
          playlists={playlists}
          onSelectLibrary={onSelectLibrary}
          onSelectAlbum={onSelectAlbum}
          onSelectExplore={onSelectExplore}
        />
      </div>
    </div>
  );
}
