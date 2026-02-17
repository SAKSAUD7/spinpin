import "@repo/ui/styles.css";
import "./globals.css";
import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { UIProvider } from "../state/ui/uiContext";
import { GlobalAlert } from "../components/GlobalAlert";

import { getMetadata } from "@/seo/seo.config";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = getMetadata();
export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}): JSX.Element {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${inter.variable} ${outfit.variable} font-sans bg-background text-white`}>
                <UIProvider>
                    <GlobalAlert />
                    {children}
                </UIProvider>
            </body>
        </html>
    );
}
