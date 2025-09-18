"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import ParticleBackground from "@/components/ParticleBackground";
import { DEMO_CREDENTIALS, LOGIN_FLAG_KEY, USERNAME_KEY } from "@/utils/auth";
import { sanitizeDisplayName } from "@/utils/text";

const initialFormState = {
  username: "",
  password: "",
};

export default function LoginPage() {
  const router = useRouter();
  const [formState, setFormState] = useState(initialFormState);
  const [error, setError] = useState("");
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

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmedUsername = formState.username.trim();
    const password = formState.password;

    if (!trimmedUsername || !password) {
      setError("Please enter both username and password.");
      return;
    }

    const isUsernameValid = trimmedUsername.toLowerCase() === DEMO_CREDENTIALS.username;
    const isPasswordValid = password === DEMO_CREDENTIALS.password;

    if (isUsernameValid && isPasswordValid) {
      const safeName = sanitizeDisplayName(trimmedUsername) || "User";
      window.localStorage.setItem(LOGIN_FLAG_KEY, "true");
      window.localStorage.setItem(USERNAME_KEY, safeName);
      router.replace("/dashboard");
      return;
    }

    setError("Invalid username or password. Try again.");
  };

  return (
    <div className="page-shell" role="main">
      <ParticleBackground />
      {ready && (
        <section className="glass-card" aria-labelledby="login-title">
          <h1 id="login-title">CVNS Dashboard Login</h1>
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                value={formState.username}
                onChange={handleChange}
                placeholder="Enter your username"
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
            <button type="submit" className="primary-button">
              Login
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
