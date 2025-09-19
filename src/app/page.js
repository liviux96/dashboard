"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import ParticleBackground from "@/components/ParticleBackground";
import {
  ACCESS_TOKEN_KEY,
  LOGIN_FLAG_KEY,
  REFRESH_TOKEN_KEY,
  USERNAME_KEY,
} from "@/utils/auth";
import { sanitizeDisplayName } from "@/utils/text";
import { signInWithEmailPassword } from "@/utils/supabase";

const initialFormState = {
  email: "",
  password: "",
};

export default function LoginPage() {
  const router = useRouter();
  const [formState, setFormState] = useState(initialFormState);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const alreadyLoggedIn = window.localStorage.getItem(LOGIN_FLAG_KEY) === "true";

    if (alreadyLoggedIn) {
      router.replace("/dashboard");
    } else {
      setReady(true);
    }
  }, [router]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    const trimmedEmail = formState.email.trim().toLowerCase();
    const password = formState.password;

    if (!trimmedEmail || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { user, access_token: accessToken, refresh_token: refreshToken } =
        await signInWithEmailPassword(trimmedEmail, password);

      if (!accessToken) {
        throw new Error("Supabase did not return an access token.");
      }

      const metadataName = sanitizeDisplayName(
        user?.user_metadata?.display_name || user?.user_metadata?.full_name,
      );
      // TODO: Add a display name to the Supabase user profile via the Supabase dashboard.
      const fallbackName =
        metadataName ||
        sanitizeDisplayName(user?.email?.split("@")[0]) ||
        sanitizeDisplayName(trimmedEmail);
      const safeName = fallbackName || "User";

      window.localStorage.setItem(LOGIN_FLAG_KEY, "true");
      window.localStorage.setItem(USERNAME_KEY, safeName);
      window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);

      if (refreshToken) {
        window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      } else {
        window.localStorage.removeItem(REFRESH_TOKEN_KEY);
      }

      router.replace("/dashboard");
    } catch (submitError) {
      console.error("Supabase sign-in failed:", submitError);
      setError(submitError.message || "Invalid email or password. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-shell" role="main">
      <ParticleBackground />
      {ready && (
        <section className="glass-card" aria-labelledby="login-title">
          <h1 id="login-title">CVNS Dashboard Login</h1>
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formState.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={formState.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
            </div>
            <button type="submit" className="primary-button" disabled={isSubmitting}>
              {isSubmitting ? "Logging in..." : "Login"}
            </button>
            {error && (
              <p role="alert" className="error-message">
                {error}
              </p>
            )}
          </form>
        </section>
      )}
    </div>
  );
}
