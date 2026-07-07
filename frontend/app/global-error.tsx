"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";
import { BouncyButton } from "@repo/ui";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error("Global catastrophic error caught:", error);
    }, [error]);

    return (
        <html lang="en">
            <body className="bg-background text-white min-h-screen flex items-center justify-center p-4 font-sans">
                <div className="max-w-md w-full text-center">
                    <div className="w-24 h-24 bg-red-500/10 border-2 border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="w-12 h-12 text-red-400" />
                    </div>
                    
                    <h1 className="text-3xl font-black mb-4">Something went critically wrong!</h1>
                    
                    <p className="text-white/60 mb-8">
                        We apologize, but a critical error occurred that prevented the page from loading. 
                        Our team has been notified.
                    </p>
                    
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-8 text-left text-sm font-mono text-red-300 overflow-hidden break-words">
                        {error.message || "Unknown Application Error"}
                        {error.digest && <div className="mt-2 text-white/30 text-xs">Digest: {error.digest}</div>}
                    </div>

                    <div className="flex flex-col gap-3">
                        <BouncyButton 
                            onClick={() => reset()} 
                            variant="primary" 
                            className="w-full justify-center"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Try Again
                        </BouncyButton>
                        
                        <BouncyButton 
                            onClick={() => window.location.href = '/'} 
                            variant="outline" 
                            className="w-full justify-center"
                        >
                            <Home className="w-4 h-4 mr-2" />
                            Return Home
                        </BouncyButton>
                    </div>
                </div>
            </body>
        </html>
    );
}
