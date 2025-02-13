import "./globals.css";
import { Inter } from "next/font/google";
import Header from "@/components/Header";
import type { Metadata } from "next";
import type React from "react"; // Added import for React

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Y-Blog",
    template: "%s | Y-Blog",
  },
  description: "yutanpo1227のブログです。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={inter.className}>
      <meta
        name="google-site-verification"
        content="yls0n_4Y7DnKtNpTU9p6N5It8fWnSPvj5IeV-0KgI50"
      />
      <body className="min-h-screen bg-background font-sans antialiased">
        <div className="relative bg-gray-50 flex min-h-screen flex-col">
          <Header />
          <div className="flex-1">
            <main className="container mx-auto py-6 px-4">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
