import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

import { ModeToggle } from "@/components/mode-toggle";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "AI UI Dev Loop",
  description: "Next.js + shadcn + Playwright MCP demo template",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="min-h-dvh bg-background text-foreground">
            <header className="border-b">
              <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
                <div className="flex items-center gap-4">
                  <Link href="/" className="font-semibold tracking-tight">
                    AI UI Dev Loop
                  </Link>
                  <Link
                    href="/dev-loop"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    /dev-loop
                  </Link>
                </div>
                <ModeToggle />
              </div>
            </header>
            <main className="mx-auto max-w-4xl px-6 py-10">{children}</main>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
