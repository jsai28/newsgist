import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NewsGist - Canadian News Summaries",
  description:
    "Daily summaries of Canadian news from major outlets including CBC, CTV, Global News, Globe and Mail, and Toronto Star.",
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
