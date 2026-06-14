#!/usr/bin/env node
/**
 * Manual Spotify PKCE smoke test (no client secret required).
 *
 * Usage:
 *   node scripts/spotify-oauth-test.mjs
 *
 * Opens an auth URL, then paste the ?code= from the callback URL to verify
 * token exchange against Spotify's servers.
 */

import crypto from "node:crypto";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const CLIENT_ID =
  process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID ?? "0082fbc4510146fa8475b409f053867d";
const REDIRECT_URI =
  process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI ??
  "http://127.0.0.1:3000/callback";

function base64Url(buffer) {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

function createPkce() {
  const verifier = base64Url(crypto.randomBytes(32));
  const challenge = base64Url(
    crypto.createHash("sha256").update(verifier).digest()
  );
  return { verifier, challenge };
}

const scopes = [
  "user-read-private",
  "user-read-email",
  "user-top-read",
].join(" ");

const { verifier, challenge } = createPkce();

const authUrl =
  `https://accounts.spotify.com/authorize?` +
  `client_id=${CLIENT_ID}&` +
  `response_type=code&` +
  `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
  `scope=${encodeURIComponent(scopes)}&` +
  `code_challenge=${challenge}&` +
  `code_challenge_method=S256`;

console.log("\nSpotify PKCE smoke test\n");
console.log("Client ID:", CLIENT_ID);
console.log("Redirect URI:", REDIRECT_URI);
console.log("\n1) Open this URL in your browser and approve access:\n");
console.log(authUrl);
console.log("\n2) After redirect, copy the full callback URL (or just the code).\n");

const rl = readline.createInterface({ input, output });
const pasted = await rl.question("Paste callback URL or code: ");
rl.close();

const code = pasted.includes("code=")
  ? new URL(pasted).searchParams.get("code")
  : pasted.trim();

if (!code) {
  console.error("No authorization code found.");
  process.exit(1);
}

console.log(`\nCode length: ${code.length} characters`);

const response = await fetch("https://accounts.spotify.com/api/token", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: REDIRECT_URI,
    client_id: CLIENT_ID,
    code_verifier: verifier,
  }),
});

const body = await response.text();
console.log("\nSpotify token response:", response.status);
console.log(body);

if (!response.ok) {
  process.exit(1);
}

const data = JSON.parse(body);
const profileRes = await fetch("https://api.spotify.com/v1/me", {
  headers: { Authorization: `Bearer ${data.access_token}` },
});
const profile = await profileRes.json();
console.log("\nConnected as:", profile.display_name ?? profile.id ?? profile);
