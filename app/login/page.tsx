"use client";

import { useState } from "react";
import { Mail, Lock, ArrowRight, ActivitySquare } from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        
        try {
            const res = await axios.post("http://localhost:3001/auth/login", { email, password });
            if (res.data.token) {
                localStorage.setItem("token", res.data.token);
                router.push("/chat");
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "Invalid credentials. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center bg-[#0a0a0a] overflow-hidden font-sans">
            {/* Background animated gradients */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 blur-[120px] rounded-full animate-pulse delay-1000" />
            
            <div className="relative z-10 w-full max-w-[420px] p-8 sm:p-10 bg-[#111111]/80 backdrop-blur-2xl border border-white/5 rounded-[24px] shadow-2xl mx-4">
                
                {/* Decorative top gradient border line */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-80" />

                <div className="flex flex-col items-center mb-10 mt-2">
                    <div className="w-16 h-16 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center p-0.5 shadow-lg shadow-purple-500/20 mb-6">
                        <div className="w-full h-full bg-[#0a0a0a] rounded-[14px] flex items-center justify-center">
                            <ActivitySquare className="w-7 h-7 text-white" />
                        </div>
                    </div>
                    <h1 className="text-[28px] font-semibold text-white tracking-tight">Welcome back</h1>
                    <p className="text-[14px] text-gray-400 mt-2 text-center font-medium">Enter your details to access your dashboard.</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[14px] text-center font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div className="space-y-2 group">
                        <label className="text-[13px] font-medium text-gray-300 ml-1">Email Address</label>
                        <div className="relative flex items-center">
                            <Mail className="absolute left-4 w-5 h-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-[44px] pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-[15px] text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-medium"
                                placeholder="name@company.com"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2 group">
                        <div className="flex items-center justify-between ml-1">
                            <label className="text-[13px] font-medium text-gray-300">Password</label>
                            <a href="#" className="text-[13px] font-medium text-blue-400 hover:text-blue-300 transition-colors">Forgot password?</a>
                        </div>
                        <div className="relative flex items-center">
                            <Lock className="absolute left-4 w-5 h-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-[44px] pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-[15px] text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-medium"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="group w-full relative flex items-center justify-center gap-2 py-3.5 bg-white text-black font-semibold rounded-xl hover:bg-gray-200 transition-all focus:outline-none focus:ring-4 focus:ring-white/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span className="text-[15px]">Sign In</span>
                                    <ArrowRight className="w-[18px] h-[18px] group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </div>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-[14px] text-gray-400 font-medium">
                        Don't have an account?{" "}
                        <a href="#" className="font-semibold text-white hover:text-blue-400 transition-colors">
                            Sign up for free
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
