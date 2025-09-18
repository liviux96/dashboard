import "./globals.css";

import LiveTimestamp from "@/components/LiveTimestamp";

export const metadata = {
  title: "CVNS Dashboard",
  description: "Secure client-side demo login and dashboard experience.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <LiveTimestamp />
      </body>
    </html>
  );
}
