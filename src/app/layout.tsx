import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "ARVX — ton cours entre, ARVX s'occupe du reste",
  description:
    "Apporte ton cours — n'importe quel niveau, n'importe quelle matière. ARVX le transforme en résumé, pas à pas, examens et progression. Tes cours restent sur ton appareil.",
  keywords: ["ARVX", "révision", "examens", "cours", "études", "progression"],
  authors: [{ name: "Écosystème ARVEXA" }],
  openGraph: {
    title: "ARVX — ton cours entre, ARVX s'occupe du reste",
    description: "Ton cours devient résumé, pas à pas, examens et progression.",
    siteName: "ARVX",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#F6F7FB",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased bg-background text-foreground`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
