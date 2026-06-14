"use client";

import { useEffect, useState } from "react";
import spotifyAPI from "@/lib/spotify";

function dedupeById(items, max) {
  const seen = new Set();
  const result = [];
  for (const item of items) {
    if (!item?.id || seen.has(item.id)) continue;
    seen.add(item.id);
    result.push(item);
    if (result.length >= max) break;
  }
  return result;
}

function genresFromArtists(artists, max = 6) {
  const seen = new Set();
  const genres = [];
  for (const artist of artists) {
    for (const genre of artist.genres ?? []) {
      const label = genre
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
      if (!seen.has(label.toLowerCase())) {
        seen.add(label.toLowerCase());
        genres.push(label);
      }
      if (genres.length >= max) break;
    }
    if (genres.length >= max) break;
  }
  return genres;
}

export function useSpotifyTaste(isConnected) {
  const [taste, setTaste] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isConnected) {
      setTaste(null);
      return;
    }

    let cancelled = false;
    setLoading(true);

    Promise.all([
      spotifyAPI.getTopArtists("medium_term", 10),
      spotifyAPI.getTopTracks("short_term", 10),
      spotifyAPI.getRecentlyPlayed(15),
    ])
      .then(([topArtists, topTracks, recent]) => {
        if (cancelled) return;
        setTaste({
          topArtists: topArtists.slice(0, 8),
          topTracks: dedupeById(topTracks, 8),
          recentTracks: dedupeById(recent, 6),
          topGenres: genresFromArtists(topArtists, 6),
        });
      })
      .catch((error) => {
        console.error("Failed to load taste profile:", error);
        if (!cancelled) setTaste(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isConnected]);

  return { taste, loading };
}
