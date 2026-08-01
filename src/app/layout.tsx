import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IEDC Portal — Student Engagement & Event Management",
  description:
    "Innovation and Entrepreneurship Development Cell portal for student engagement, event management, QR attendance, leaderboards, and project showcases.",
  keywords: [
    "IEDC",
    "student portal",
    "events",
    "innovation",
    "entrepreneurship",
  ],
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased font-sans" suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}