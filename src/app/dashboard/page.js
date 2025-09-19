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
import { getGreetingForDate } from "@/utils/time";
import { sanitizeDisplayName } from "@/utils/text";
import { getUser, signOut } from "@/utils/supabase";

const iconProps = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

function TruckIcon(props) {
  return (
    <svg {...iconProps} {...props}>
      <path d="M3 16V7.5a1.5 1.5 0 0 1 1.5-1.5h8.5v6h4.3l2.2 2.2V16" />
      <circle cx="7" cy="16.5" r="1.6" />
      <circle cx="17" cy="16.5" r="1.6" />
      <path d="M3 16h1.9" />
      <path d="M12 12V6" />
    </svg>
  );
}

function GaugeIcon(props) {
  return (
    <svg {...iconProps} {...props}>
      <path d="M5.5 18.5a8.5 8.5 0 1 1 13 0" />
      <path d="M12 13.5l2.8-2.8" />
      <circle cx="12" cy="13.5" r="1.2" />
      <path d="M4.5 14.5h1.8" />
      <path d="M17.7 9.1l1.3-1.3" />
    </svg>
  );
}

function PackageIcon(props) {
  return (
    <svg {...iconProps} {...props}>
      <path d="M20 8.5v7.8a1.7 1.7 0 0 1-0.9 1.5l-6.3 3.1a1.7 1.7 0 0 1-1.5 0L5 17.8a1.7 1.7 0 0 1-0.9-1.5V8.5a1.7 1.7 0 0 1 0.9-1.5l6.3-3.1a1.7 1.7 0 0 1 1.5 0l6.3 3.1a1.7 1.7 0 0 1 0.9 1.5z" />
      <path d="M3.9 7.5L12 11l8.1-3.5" />
      <path d="M12 22V11" />
      <path d="M9 14.5l2.4 2.4 3.6-3.6" />
    </svg>
  );
}

function CheatsheetIcon(props) {
  return (
    <svg {...iconProps} {...props}>
      <path d="M7 3h7l4 4v12.5A1.5 1.5 0 0 1 16.5 21h-9A1.5 1.5 0 0 1 6 19.5v-14A1.5 1.5 0 0 1 7.5 4" />
      <path d="M14 3v4h4" />
      <path d="M8.5 12.5h7" />
      <path d="M8.5 16h4.5" />
      <path d="M8.5 9h3" />
    </svg>
  );
}

function HistoryIcon(props) {
  return (
    <svg {...iconProps} {...props}>
      <path d="M4.5 13a7.5 7.5 0 1 1 2.2 5.3" />
      <path d="M4.5 13h3.5" />
      <path d="M12 8v5l3 2" />
    </svg>
  );
}

function DashboardIcon(props) {
  return (
    <svg {...iconProps} {...props}>
      <rect x="3.5" y="4" width="7.5" height="6.5" rx="1.2" />
      <rect x="13" y="4" width="7.5" height="4.8" rx="1.2" />
      <rect x="3.5" y="12" width="7.5" height="7" rx="1.2" />
      <rect x="13" y="10.5" width="7.5" height="8.5" rx="1.2" />
    </svg>
  );
}

function BarcodeIcon(props) {
  return (
    <svg {...iconProps} {...props}>
      <line x1="4.5" y1="5.5" x2="4.5" y2="18.5" />
      <line x1="7" y1="5.5" x2="7" y2="18.5" />
      <line x1="9.5" y1="5.5" x2="9.5" y2="18.5" />
      <line x1="12.5" y1="5.5" x2="12.5" y2="18.5" />
      <line x1="15.5" y1="5.5" x2="15.5" y2="18.5" />
      <line x1="18" y1="5.5" x2="18" y2="18.5" />
    </svg>
  );
}

const QUICK_ACTIONS = [
  { label: "Truck Monitor", Icon: TruckIcon },
  { label: "Productivity Monitor", Icon: GaugeIcon },
  { label: "Delivery Monitor", Icon: PackageIcon },
  { label: "Cheatsheet", Icon: CheatsheetIcon },
  { label: "User History", Icon: HistoryIcon },
  { label: "Main Dashboard", Icon: DashboardIcon },
  { label: "Barcode Generator", Icon: BarcodeIcon },
];

export default function DashboardPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("User");
  const [greeting, setGreeting] = useState(() => getGreetingForDate(new Date()));
  const [ready, setReady] = useState(false);

  const clearSession = () => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.removeItem(LOGIN_FLAG_KEY);
    window.localStorage.removeItem(USERNAME_KEY);
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  };

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    let isActive = true;

    const initialize = async () => {
      const loggedIn = window.localStorage.getItem(LOGIN_FLAG_KEY) === "true";
      const accessToken = window.localStorage.getItem(ACCESS_TOKEN_KEY);

      if (!loggedIn || !accessToken) {
        clearSession();
        router.replace("/");
        return;
      }

      try {
        const user = await getUser(accessToken);

        if (!user) {
          clearSession();
          router.replace("/");
          return;
        }

        const storedName = sanitizeDisplayName(
          window.localStorage.getItem(USERNAME_KEY),
        );
        const metadataName = sanitizeDisplayName(
          user?.user_metadata?.display_name || user?.user_metadata?.full_name,
        );
        const emailHandle = sanitizeDisplayName(user?.email?.split("@")[0]);
        const safeName = metadataName || storedName || emailHandle || "User";

        if (!storedName || storedName !== safeName) {
          window.localStorage.setItem(USERNAME_KEY, safeName);
        }

        if (!isActive) {
          return;
        }

        setDisplayName(safeName);
        setReady(true);
      } catch (error) {
        console.error("Failed to validate Supabase session:", error);
        clearSession();
        router.replace("/");
      }
    };

    initialize();

    return () => {
      isActive = false;
    };
  }, [router]);

  useEffect(() => {
    const updateGreeting = () => setGreeting(getGreetingForDate(new Date()));
    updateGreeting();
    const intervalId = window.setInterval(updateGreeting, 60_000);
    return () => window.clearInterval(intervalId);
  }, []);

  const handleLogout = async () => {
    if (typeof window === "undefined") {
      return;
    }

    const accessToken = window.localStorage.getItem(ACCESS_TOKEN_KEY);
    const refreshToken = window.localStorage.getItem(REFRESH_TOKEN_KEY);

    await signOut(accessToken, refreshToken);

    clearSession();

    router.replace("/");
  };

  const handleQuickAction = (label) => {
    console.info(`[Quick Action] ${label}`);
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
        <div className="quick-actions" role="navigation" aria-label="Dashboard quick links">
          <div className="quick-actions-track">
            {QUICK_ACTIONS.map(({ label, Icon }) => (
              <button
                type="button"
                key={label}
                className="quick-action-button"
                onClick={() => handleQuickAction(label)}
              >
                <Icon className="quick-action-icon" aria-hidden="true" focusable="false" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
