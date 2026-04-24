import type { Metadata } from "next";
import { Inter, Orbitron, Space_Mono } from "next/font/google";
import { AppShell } from "@/components/layout/AppShell";
import "./globals.css";
import styles from "./layout.module.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Platform",
    template: "%s · Platform",
  },
  description: "Platform dashboard and product shell",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${orbitron.variable} ${spaceMono.variable}`}>
      <body className={styles.root}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
