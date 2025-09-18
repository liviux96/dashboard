"use client";

import { useEffect, useState } from "react";

const formatTimestamp = (date) => {
  const pad = (value) => String(value).padStart(2, "0");
  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1);
  const year = date.getFullYear();
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
};

export default function LiveTimestamp() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const updateTimestamp = () => setNow(new Date());
    updateTimestamp();
    const intervalId = window.setInterval(updateTimestamp, 1_000);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <time
      className="live-timestamp"
      suppressHydrationWarning
      dateTime={now.toISOString()}
      aria-live="off"
    >
      {formatTimestamp(now)}
    </time>
  );
}
