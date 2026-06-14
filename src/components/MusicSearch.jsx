"use client";

import { useState } from "react";
import {
  Search,
  Play,
  Pause,
  ExternalLink,
  Music2,
  Clock,
  LogIn,
  Loader2,
} from "lucide-react";
import spotifyAPI from "@/lib/spotify";
import { useSpotify } from "@/contexts/SpotifyContext";
import { usePlayer } from "@/contexts/PlayerContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const POPULAR_TERMS = [
  "Bohemian Rhapsody",
  "Blinding Lights",
  "Shape of You",
  "Levitating",
  "Arjan Dhillon",
];

export function MusicSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { isConnected, connect } = useSpotify();
  const { playTrack, currentTrack, isPlaying, togglePlayPause } = usePlayer();

  const handleSearch = async (query) => {
    const trimmed = query.trim();
    if (!trimmed) return;

    setLoading(true);
    setHasSearched(true);

    try {
      const token = await spotifyAPI.getAccessToken();
      if (token) {
        const results = await spotifyAPI.searchTracks(trimmed, 25);
        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = async (song) => {
    if (currentTrack?.id === song.id) {
      togglePlayPause();
      return;
    }
    await playTrack(song, searchResults);
  };

  const formatDuration = (ms) => {
    if (!ms) return "0:00";
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="page-scroll">
      <div className="page-content pb-8">
        <div className="mb-6">
          <h1 className="font-display text-[28px] font-extrabold text-foreground">
            Search
          </h1>
          <p className="mt-1 font-body text-sm text-muted-foreground">
            Find songs, artists, and albums from Spotify
          </p>
        </div>

        {/* Search input */}
        <form
          className="mb-6 flex gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(searchQuery);
          }}
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="What do you want to listen to?"
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
                Searching
              </>
            ) : (
              "Search"
            )}
          </Button>
        </form>

        {/* Connect Spotify */}
        {!isConnected && (
          <div className="mb-8 rounded-2xl border border-border bg-card p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--spotify-green)]/15">
                  <Music2 className="h-5 w-5 text-[var(--spotify-green)]" />
                </div>
                <div>
                  <p className="font-display text-sm font-semibold text-foreground">
                    Connect Spotify to search millions of tracks
                  </p>
                  <p className="mt-1 font-body text-xs leading-relaxed text-muted-foreground">
                    Link your account to search and play music from your library.
                  </p>
                </div>
              </div>
              <Button
                onClick={connect}
                className="shrink-0 rounded-full bg-[var(--spotify-green)] text-white hover:bg-[var(--spotify-green)]/90"
              >
                <LogIn className="mr-2 h-4 w-4" />
                Connect Spotify
              </Button>
            </div>
          </div>
        )}

        {/* Popular searches */}
        {!hasSearched && searchResults.length === 0 && (
          <div className="mb-8">
            <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
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
                  className="rounded-full border border-border bg-[var(--surface-container-high)] px-4 py-2 font-body text-sm text-foreground transition-colors hover:border-primary/30 hover:bg-primary/10"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
            Searching Spotify…
          </div>
        )}

        {/* Results */}
        {!loading && searchResults.length > 0 && (
          <div>
            <p className="mb-3 font-display text-sm font-semibold text-muted-foreground">
              {searchResults.length} result{searchResults.length !== 1 ? "s" : ""}
            </p>
            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 border-b border-border px-4 py-3 font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground max-sm:hidden sm:grid-cols-[auto_1fr_1fr_auto_auto]">
                <span className="w-8 text-center">#</span>
                <span>Title</span>
                <span className="hidden sm:block">Album</span>
                <span className="hidden w-16 text-right sm:block">
                  <Clock className="ml-auto h-3.5 w-3.5" />
                </span>
                <span className="w-10" />
              </div>

              {searchResults.map((song, index) => {
                const active = currentTrack?.id === song.id;
                return (
                  <div
                    key={song.id}
                    className={cn(
                      "group grid grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-2.5 transition-colors sm:grid-cols-[auto_1fr_1fr_auto_auto]",
                      active
                        ? "bg-primary/10"
                        : "hover:bg-[var(--surface-container-high)]"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => handlePlay(song)}
                      className="flex w-8 items-center justify-center border-none bg-transparent font-body text-sm tabular-nums text-muted-foreground"
                    >
                      {active && isPlaying ? (
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
                      ) : (
                        index + 1
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handlePlay(song)}
                      className="flex min-w-0 items-center gap-3 border-none bg-transparent p-0 text-left"
                    >
                      {song.images?.[0]?.url ? (
                        <img
                          src={song.images[0].url}
                          alt={song.album}
                          className="h-10 w-10 shrink-0 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                          <Music2 className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p
                          className={cn(
                            "truncate font-display text-sm font-semibold",
                            active ? "text-primary" : "text-foreground"
                          )}
                        >
                          {song.name}
                          {song.explicit && (
                            <span className="ml-2 inline-flex rounded px-1 py-0.5 font-body text-[10px] font-medium text-muted-foreground ring-1 ring-border">
                              E
                            </span>
                          )}
                        </p>
                        <p className="truncate font-body text-xs text-muted-foreground">
                          {song.artist}
                        </p>
                      </div>
                    </button>

                    <p className="hidden truncate font-body text-sm text-muted-foreground sm:block">
                      {song.album}
                    </p>

                    <span className="hidden w-16 text-right font-body text-xs tabular-nums text-muted-foreground sm:block">
                      {song.duration_formatted || formatDuration(song.duration_ms)}
                    </span>

                    <div className="flex w-10 items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => handlePlay(song)}
                        className="flex h-8 w-8 items-center justify-center rounded-full border-none bg-transparent text-muted-foreground opacity-0 transition-all hover:bg-primary/15 hover:text-primary group-hover:opacity-100"
                        aria-label={active && isPlaying ? "Pause" : "Play"}
                      >
                        {active && isPlaying ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </button>
                      {song.external_urls?.spotify && (
                        <a
                          href={song.external_urls.spotify}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground opacity-0 transition-all hover:bg-[var(--surface-container-high)] hover:text-foreground group-hover:opacity-100"
                          aria-label="Open in Spotify"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* No results */}
        {!loading && hasSearched && searchResults.length === 0 && (
          <div className="rounded-2xl border border-border bg-card py-16 text-center">
            <Music2 className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <p className="font-display text-lg font-semibold text-foreground">
              No results for &ldquo;{searchQuery}&rdquo;
            </p>
            <p className="mt-1 font-body text-sm text-muted-foreground">
              Try a different song, artist, or album name.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
