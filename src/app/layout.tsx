import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { SubscriptionAlert } from "@/features/subscriptions/components/subscription-alert";
import { AuthProvider } from "@/hooks/use-auth";
import { Modals } from "@/components/modals";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";
import { FontPreloader } from "@/components/font-preloader";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Editei",
  description: "Crie designs incríveis em minutos!",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "32x32", type: "image/x-icon" }
    ],
    shortcut: "/favicon.ico",
    apple: "/favicon.svg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <AuthProvider>
          <Providers>
            <FontPreloader />
            <Toaster />
            <Modals />
            <SubscriptionAlert />
            {children}
          </Providers>
        </AuthProvider>
      </body>
    </html>
  );
}
