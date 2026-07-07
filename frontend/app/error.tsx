"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";
import { BouncyButton } from "@repo/ui";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error("Application error caught by boundary:", error);
    }, [error]);

    return (
        <div className="min-h-[70vh] flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center">
                <div className="w-20 h-20 bg-red-500/10 border-2 border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="w-10 h-10 text-red-400" />
                </div>
                
                <h2 className="text-3xl font-black mb-4">Oops! Something went wrong</h2>
                
                <p className="text-white/60 mb-8">
                    We're having trouble loading this section. Please try again.
                </p>
                
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-8 text-left text-sm font-mono text-red-300 overflow-hidden break-words">
                    {error.message || "Unknown Application Error"}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <BouncyButton 
                        onClick={() => reset()} 
                        variant="primary" 
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Try Again
                    </BouncyButton>
                    
                    <Link href="/">
                        <BouncyButton variant="outline">
                            <Home className="w-4 h-4 mr-2" />
                            Return Home
                        </BouncyButton>
                    </Link>
                </div>
            </div>
        </div>
    );
}
