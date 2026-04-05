"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
    const router = useRouter();

    useEffect(() => {
        // Run token check purely on the client side
        const token = localStorage.getItem("token");
        
        if (token) {
            router.push("/chat");
        } else {
            router.push("/login");
        }
    }, [router]);

    // Simple loading state while we redirect
    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
    );
}
