"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import ParticleBackground from "@/components/ParticleBackground";
import { LOGIN_FLAG_KEY, USERNAME_KEY } from "@/utils/auth";
import { getGreetingForDate } from "@/utils/time";

export default function DashboardPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("User");
  const [greeting, setGreeting] = useState(() => getGreetingForDate(new Date()));
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const loggedIn = window.localStorage.getItem(LOGIN_FLAG_KEY) === "true";
    const storedName = window.localStorage.getItem(USERNAME_KEY);

    if (!loggedIn || !storedName) {
      router.replace("/");
      return;
    }

    setDisplayName(storedName);
    setReady(true);
  }, [router]);

  useEffect(() => {
    const updateGreeting = () => setGreeting(getGreetingForDate(new Date()));
    updateGreeting();
    const intervalId = window.setInterval(updateGreeting, 60_000);
    return () => window.clearInterval(intervalId);
  }, []);

  const handleLogout = () => {
    window.localStorage.removeItem(LOGIN_FLAG_KEY);
    window.localStorage.removeItem(USERNAME_KEY);
    router.replace("/");
  };

  if (!ready) {
    return (
      <div className="page-shell">
        <ParticleBackground />
      </div>
    );
  }

  return (
    <div className="page-shell" role="main">
      <ParticleBackground />
      <button type="button" className="logout-button" onClick={handleLogout}>
        Logout
      </button>
      <div className="greeting-wrapper">
        <h1>
          {greeting}, {displayName}
        </h1>
        <p>Welcome to the CVNS dashboard.</p>
      </div>
    </div>
  );
}
