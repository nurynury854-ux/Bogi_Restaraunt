import type { Metadata, Viewport } from "next";
import { Inter, Fraunces } from "next/font/google";
import { PageTransition } from "@/components/PageTransition";
import { PLATFORM_NAME } from "@/lib/constants";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["600", "700", "900"],
});

export const metadata: Metadata = {
  title: `${PLATFORM_NAME} — Online Ordering for Restaurants`,
  description:
    "Spin up your own branded online ordering site in minutes. Menus, locations, live orders — all self-serve.",
};

export const viewport: Viewport = {
  themeColor: "#c8722e",
  width: "device-width",
  initialScale: 1,
  // Let content extend into the notch / rounded-corner areas so our
  // safe-area-aware padding can position fixed UI correctly on phones.
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  );
}
