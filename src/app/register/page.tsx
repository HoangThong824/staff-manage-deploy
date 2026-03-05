"use client";

import { registerAction } from "@/actions/auth";
import { useState } from "react";
import Link from "next/link";
import { UserPlus, Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const result = await registerAction(formData);

        if (result?.error) {
            setError(result.error);
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-card border rounded-3xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-500">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white text-center">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/30">
                        <UserPlus size={32} />
                    </div>
                    <h1 className="text-2xl font-bold">Create Account</h1>
                    <p className="text-blue-100 mt-2">Join the StaffMNG HR community</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-5">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm border border-red-100 animate-in fade-in slide-in-from-top-2">
                            {error}
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700 ml-1">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -content-y-1/2 text-slate-400" size={18} />
                            <input
                                name="name"
                                type="text"
                                required
                                placeholder="John Doe"
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700 ml-1">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -content-y-1/2 text-slate-400" size={18} />
                            <input
                                name="email"
                                type="email"
                                required
                                placeholder="admin@example.com"
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700 ml-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -content-y-1/2 text-slate-400" size={18} />
                            <input
                                name="password"
                                type="password"
                                required
                                placeholder="••••••••"
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-blue-200 flex items-center justify-center gap-2 group transition-all"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : (
                            <>
                                Create Account
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>

                    <p className="text-center text-sm text-slate-600 pt-2">
                        Already have an account?{" "}
                        <Link href="/login" className="text-blue-600 font-semibold hover:underline underline-offset-4">
                            Log in here
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
