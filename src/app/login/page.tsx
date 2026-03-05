"use client";

import { loginAction } from "@/actions/auth";
import { useState } from "react";
import Link from "next/link";
import { LogIn, Mail, Lock, ArrowRight, Loader2, ShieldCheck } from "lucide-react";

export default function LoginPage() {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const result = await loginAction(formData);

        if (result?.error) {
            setError(result.error);
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-card border rounded-3xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-500">
                <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 text-white text-center">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/30">
                        <LogIn size={32} />
                    </div>
                    <h1 className="text-2xl font-bold">Welcome Back</h1>
                    <p className="text-blue-100 mt-2">Sign in to your HR Dashboard</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm border border-red-100 animate-in fade-in slide-in-from-top-2">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 ml-1">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -content-y-1/2 text-slate-400" size={18} />
                            <input
                                name="email"
                                type="email"
                                required
                                placeholder="admin@example.com"
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center ml-1">
                            <label className="text-sm font-medium text-slate-700">Password</label>
                            <Link href="#" className="text-xs text-blue-600 hover:underline">Forgot password?</Link>
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -content-y-1/2 text-slate-400" size={18} />
                            <input
                                name="password"
                                type="password"
                                required
                                placeholder="••••••••"
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 group transition-all"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : (
                            <>
                                Sign In
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>

                    <p className="text-center text-sm text-slate-600 pt-2">
                        New here?{" "}
                        <Link href="/register" className="text-blue-600 font-semibold hover:underline underline-offset-4">
                            Create an account
                        </Link>
                    </p>

                    <div className="flex items-center gap-2 justify-center text-slate-400 pt-4 grayscale opacity-50">
                        <ShieldCheck size={16} />
                        <span className="text-[10px] uppercase font-bold tracking-widest">Enterprise Secure</span>
                    </div>
                </form>
            </div>
        </div>
    );
}
