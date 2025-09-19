const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function ensureConfig() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      "Supabase environment variables are missing. Please define NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }
}

function buildHeaders(accessToken) {
  const headers = {
    apikey: SUPABASE_ANON_KEY,
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  return headers;
}

export async function signInWithEmailPassword(email, password) {
  ensureConfig();

  const response = await fetch(
    `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
    {
      method: "POST",
      headers: {
        ...buildHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    },
  );

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = payload?.error_description || payload?.msg || payload?.message || "Unable to sign in.";
    throw new Error(message);
  }

  return payload;
}

export async function getUser(accessToken) {
  ensureConfig();

  if (!accessToken) {
    return null;
  }

  const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    method: "GET",
    headers: buildHeaders(accessToken),
  });

  if (response.status === 401 || response.status === 403) {
    return null;
  }

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = payload?.message || payload?.error || "Unable to fetch user.";
    throw new Error(message);
  }

  return payload;
}

export async function signOut(accessToken, refreshToken) {
  ensureConfig();

  if (!accessToken) {
    return;
  }

  try {
    const hasRefreshToken = Boolean(refreshToken);
    const headers = buildHeaders(accessToken);
    if (hasRefreshToken) {
      headers["Content-Type"] = "application/json";
    }
    await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
      method: "POST",
      headers,
      body: hasRefreshToken ? JSON.stringify({ refresh_token: refreshToken }) : undefined,
    });
  } catch (error) {
    console.error("Failed to sign out from Supabase:", error);
  }
}

// NOTE: Display names must currently be configured directly inside the Supabase dashboard.
// The automation in this repository does not have network access to update user profiles.
