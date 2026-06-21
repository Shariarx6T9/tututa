import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { JetBrains_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "AYRA", template: "%s — AYRA" },
  description: "Your private AI operating system",
  icons: {
    icon: "/icons/favicon.svg",
    apple: "/icons/apple-touch-icon.png",
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ),
};

export const viewport: Viewport = {
  themeColor: "#050507",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body className="antialiased">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "rgba(15, 15, 20, 0.95)",
              color: "#f0f0f8",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(20px)",
              borderRadius: "10px",
              fontSize: "13px",
              fontFamily: "var(--font-sans)",
            },
            success: {
              iconTheme: { primary: "#10b981", secondary: "#050507" },
            },
            error: {
              iconTheme: { primary: "#f43f5e", secondary: "#050507" },
            },
          }}
        />
      </body>
    </html>
  );
}
