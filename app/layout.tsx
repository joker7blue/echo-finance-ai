import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { darkClerkAppearance } from "@/lib/clerk-theme";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Echo Finance AI",
  description: "Talk to your AI finance assistant and get personalized financial advice, investment strategies, and market insights.",
  keywords: ["AI Finance", "Financial AI", "AI Investment", "AI Trading", "AI Portfolio Management"],
  openGraph: {
    title: "Echo Finance AI",
    description: "Talk to your AI finance assistant and get personalized financial advice, investment strategies, and market insights.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-zinc-950 text-white`}
      >
        <ClerkProvider appearance={darkClerkAppearance}>
          <AuthProvider>
            {children}
          </AuthProvider>
          <Toaster />
        </ClerkProvider>
      </body>
    </html>
  );
}
