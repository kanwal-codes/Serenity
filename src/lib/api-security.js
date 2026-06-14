const DEFAULT_ORIGINS = ["http://127.0.0.1:3000", "http://localhost:3000"];

const rateLimitStore = new Map();

function originFromUrl(url) {
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

export { originFromUrl };

export function getAllowedOrigins() {
  const origins = new Set(DEFAULT_ORIGINS);

  const fromEnv = process.env.ALLOWED_ORIGINS?.split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  fromEnv?.forEach((origin) => origins.add(origin));

  const redirectOrigin = originFromUrl(
    process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI ?? ""
  );
  if (redirectOrigin) {
    origins.add(redirectOrigin);
  }

  if (process.env.VERCEL_URL) {
    origins.add(`https://${process.env.VERCEL_URL}`);
  }

  return [...origins];
}

export function getRequestOrigin(request) {
  const origin = request.headers.get("origin");
  if (origin) {
    return origin;
  }

  const referer = request.headers.get("referer");
  if (referer) {
    return originFromUrl(referer);
  }

  return null;
}

export function isSameOriginRequest(request) {
  const allowed = getAllowedOrigins();
  const requestOrigin = getRequestOrigin(request);
  if (requestOrigin) {
    return allowed.includes(requestOrigin);
  }

  return process.env.NODE_ENV === "development";
}

/** Allow token exchange when the request Origin matches the OAuth redirect_uri origin. */
export function isRedirectUriOriginRequest(request, redirectUri) {
  const requestOrigin = getRequestOrigin(request);
  const redirectOrigin = originFromUrl(redirectUri);
  return Boolean(
    requestOrigin && redirectOrigin && requestOrigin === redirectOrigin
  );
}

export function getClientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return request.headers.get("x-real-ip") || "unknown";
}

export function checkRateLimit(key, { max = 30, windowMs = 60_000 } = {}) {
  const now = Date.now();
  const entry = rateLimitStore.get(key) ?? { count: 0, resetAt: now + windowMs };

  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + windowMs;
  }

  entry.count += 1;
  rateLimitStore.set(key, entry);

  if (rateLimitStore.size > 5000) {
    for (const [storedKey, storedEntry] of rateLimitStore) {
      if (now > storedEntry.resetAt) {
        rateLimitStore.delete(storedKey);
      }
    }
  }

  return {
    allowed: entry.count <= max,
    retryAfterSec: Math.ceil((entry.resetAt - now) / 1000),
  };
}

export function isValidPkceVerifier(value) {
  return (
    typeof value === "string" &&
    value.length >= 43 &&
    value.length <= 128 &&
    /^[A-Za-z0-9\-._~]+$/.test(value)
  );
}

export function isValidAuthCode(value) {
  return typeof value === "string" && value.length > 0 && value.length <= 2048;
}

export function isValidRefreshToken(value) {
  return typeof value === "string" && value.length >= 16 && value.length <= 512;
}
