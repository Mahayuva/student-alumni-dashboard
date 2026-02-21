import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Student-Alumni Dashboard",
  description: "Connect, Mentor, and Grow with your Alumni Network",
};

import { ThemeProvider } from "@/components/providers/ThemeContext";
import { ThemeEditor } from "@/components/features/settings/ThemeEditor";

import NextAuthProvider from "@/components/providers/SessionProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <body className={cn(inter.className, "antialiased")}>
        <NextAuthProvider>
          <ThemeProvider>
            {children}
            <Toaster position="top-right" />
          </ThemeProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
