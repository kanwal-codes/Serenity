"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import spotifyAPI from "@/lib/spotify";

const SpotifyContext = createContext(null);

export function SpotifyProvider({ children }) {
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [playlists, setPlaylists] = useState([]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const token = await spotifyAPI.getAccessToken();
      const connected = !!token;
      setIsConnected(connected);

      if (connected) {
        const [userProfile, userPlaylists] = await Promise.all([
          spotifyAPI.getUserProfile(),
          spotifyAPI.getUserPlaylists(50),
        ]);
        setProfile(userProfile);
        setPlaylists(userPlaylists);
      } else {
        setProfile(null);
        setPlaylists([]);
      }
    } catch (error) {
      console.error("Failed to refresh Spotify session:", error);
      setIsConnected(false);
      setProfile(null);
      setPlaylists([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();

    const onFocus = () => {
      refresh();
    };

    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refresh]);

  const connect = useCallback(async () => {
    try {
      await spotifyAPI.authorize();
    } catch (error) {
      console.error("Spotify connect failed:", error);
      if (typeof window !== "undefined") {
        window.alert(
          error instanceof Error
            ? error.message
            : "Could not start Spotify login. Please try again."
        );
      }
    }
  }, []);

  const disconnect = useCallback(() => {
    spotifyAPI.clearSession();
    refresh();
  }, [refresh]);

  const value = {
    isConnected,
    loading,
    profile,
    playlists,
    connect,
    disconnect,
    refresh,
  };

  return (
    <SpotifyContext.Provider value={value}>{children}</SpotifyContext.Provider>
  );
}

export function useSpotify() {
  const context = useContext(SpotifyContext);
  if (!context) {
    throw new Error("useSpotify must be used within a SpotifyProvider");
  }
  return context;
}
