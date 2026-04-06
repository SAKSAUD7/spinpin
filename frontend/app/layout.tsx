import "@repo/ui/styles.css";
import "./globals.css";
import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { UIProvider } from "../state/ui/uiContext";
import { GlobalAlert } from "../components/GlobalAlert";
import Script from "next/script";

import { getMetadata } from "@/seo/seo.config";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = getMetadata();

export const viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    themeColor: "#0a0118",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}): JSX.Element {
    const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link rel="manifest" href="/manifest.json" />
                <link rel="apple-touch-icon" href="/images/spinpin-logo.png" />
            </head>
            <body className={`${inter.variable} ${outfit.variable} font-sans bg-background text-white`}>
                {gaId && (
                    <>
                        <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
                        <Script id="ga4-init" strategy="afterInteractive">{`
                            window.dataLayer = window.dataLayer || [];
                            function gtag(){dataLayer.push(arguments);}
                            gtag('js', new Date());
                            gtag('config', '${gaId}', { page_path: window.location.pathname });
                        `}</Script>
                    </>
                )}
                <UIProvider>
                    <GlobalAlert />
                    {children}
                </UIProvider>
            </body>
        </html>
    );
}
