import type { Metadata } from "next";
import { Manrope, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"] });
const jakarta = Plus_Jakarta_Sans({ variable: "--font-jakarta", subsets: ["latin"], weight: ["600", "700", "800"] });

export const metadata: Metadata = {
  title: "Project Blueprint Builder — Cynbit prototype",
  description:
    "Scope your AI, software, cloud or marketing project in two minutes and get an instant indicative blueprint. An unofficial prototype for Cynbit Technologies.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${jakarta.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}
