"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import spotifyAPI from "@/lib/spotify";

function SpotifyCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState(null);
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) return;
    handledRef.current = true;

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

      try {
        const token = await spotifyAPI.completeOAuthFromCallback(code);
        if (!token) {
          throw new Error("Could not complete Spotify login. Please try again.");
        }
        router.replace("/");
      } catch (e) {
        console.error("Error during callback:", e);
        setError(
          e instanceof Error
            ? e.message
            : "Failed to connect to Spotify. Please try again."
        );
        setTimeout(() => router.replace("/"), 5000);
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
