"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import spotifyAPI from "@/lib/spotify";

const CALLBACK_SESSION_KEY = "spotify_callback_session";

function SpotifyCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      const errorParam = searchParams.get("error");
      if (errorParam) {
        setError(`Spotify authorization failed: ${errorParam}`);
        setTimeout(() => router.replace("/"), 4000);
        return;
      }

      const code = searchParams.get("code");
      if (!code) {
        setError("Missing Spotify authorization code. Please try connecting again.");
        setTimeout(() => router.replace("/"), 4000);
        return;
      }

      const sessionKey = `${CALLBACK_SESSION_KEY}:${code.slice(0, 48)}`;
      const sessionState = sessionStorage.getItem(sessionKey);
      if (sessionState === "done") {
        router.replace("/");
        return;
      }
      if (sessionState !== "processing") {
        sessionStorage.setItem(sessionKey, "processing");
      }

      try {
        const token = await spotifyAPI.completeOAuthFromCallback(code);
        if (!token) {
          throw new Error("Could not complete Spotify login. Please try again.");
        }
        sessionStorage.setItem(sessionKey, "done");
        router.replace("/");
      } catch (e) {
        sessionStorage.removeItem(sessionKey);
        console.error("Error during callback:", e);
        setError(
          e instanceof Error
            ? e.message
            : "Failed to connect to Spotify. Please try again."
        );
        setTimeout(() => router.replace("/"), 8000);
      }
    };

    handleCallback();
  }, [router, searchParams]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="max-w-md text-center">
          <p className="mb-2 font-display text-lg font-semibold text-foreground">
            Spotify connection failed
          </p>
          <p className="mb-4 font-body text-sm text-muted-foreground">{error}</p>
          <button
            type="button"
            onClick={() => router.replace("/")}
            className="mb-4 rounded-full bg-[var(--spotify-green)] px-5 py-2 font-body text-sm font-semibold text-black"
          >
            Back to Serenity
          </button>
          <p className="font-body text-xs text-muted-foreground">
            Redirecting you back…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-[var(--spotify-green)]" />
        <p className="font-body text-muted-foreground">Connecting to Spotify…</p>
      </div>
    </div>
  );
}

export default function SpotifyCallback() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-[var(--spotify-green)]" />
            <p className="font-body text-muted-foreground">Connecting to Spotify…</p>
          </div>
        </div>
      }
    >
      <SpotifyCallbackContent />
    </Suspense>
  );
}
