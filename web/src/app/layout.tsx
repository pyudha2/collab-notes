import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Realtime Chat",
  description: "Chat room with Socket.io",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
