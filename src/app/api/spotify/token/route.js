import { NextResponse } from "next/server";
import {
  checkRateLimit,
  getClientIp,
  isSameOriginRequest,
  isValidAuthCode,
  isValidPkceVerifier,
  isValidRefreshToken,
  originFromUrl,
} from "@/lib/api-security";

const SPOTIFY_CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
const SPOTIFY_REDIRECT_URI = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI;

function jsonError(message, status, extra = {}) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

export async function POST(request) {
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_REDIRECT_URI) {
    console.error("Spotify token route misconfigured: missing env vars");
    return jsonError("Service unavailable", 503);
  }

  if (!isSameOriginRequest(request)) {
    return jsonError("Forbidden", 403);
  }

  const clientIp = getClientIp(request);
  const rate = checkRateLimit(`spotify-token:${clientIp}`, { max: 30, windowMs: 60_000 });
  if (!rate.allowed) {
    return jsonError("Too many requests", 429, { retryAfter: rate.retryAfterSec });
  }

  try {
    const body = await request.json();
    const { code, code_verifier, refresh_token, redirect_uri: bodyRedirectUri } =
      body ?? {};

    const requestOrigin = request.headers.get("origin");

    if (refresh_token) {
      if (!isValidRefreshToken(refresh_token)) {
        return jsonError("Invalid request", 400);
      }

      const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token,
          client_id: SPOTIFY_CLIENT_ID,
        }),
      });

      if (!response.ok) {
        console.error("Spotify token refresh error:", response.status, await response.text());
        return jsonError("Failed to refresh token", response.status);
      }

      const data = await response.json();
      return NextResponse.json({
        access_token: data.access_token,
        expires_in: data.expires_in,
        refresh_token: data.refresh_token,
        scope: data.scope,
        token_type: data.token_type,
      });
    }

    if (!isValidAuthCode(code) || !isValidPkceVerifier(code_verifier)) {
      return jsonError("Invalid request", 400);
    }

    const redirectUri = bodyRedirectUri || SPOTIFY_REDIRECT_URI;
    const redirectOrigin = originFromUrl(redirectUri);

    if (
      !redirectOrigin ||
      (requestOrigin && redirectOrigin !== requestOrigin)
    ) {
      return jsonError("Invalid redirect_uri", 400);
    }

    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        client_id: SPOTIFY_CLIENT_ID,
        code_verifier,
      }),
    });

    if (!response.ok) {
      console.error("Spotify token exchange error:", response.status, await response.text());
      return jsonError("Failed to exchange token", response.status);
    }

    const data = await response.json();
    return NextResponse.json({
      access_token: data.access_token,
      expires_in: data.expires_in,
      refresh_token: data.refresh_token,
      scope: data.scope,
      token_type: data.token_type,
    });
  } catch (error) {
    console.error("Token exchange error:", error);
    return jsonError("Internal server error", 500);
  }
}
