"use client";

import { useState } from "react";
import { Lock, Eye, EyeOff, ShieldCheck, AlertCircle } from "lucide-react";
import { useData } from "@/context/DataContext";

export function ChangePasswordForm() {
    const { changePassword } = useData();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        const formData = new FormData(e.currentTarget);
        const currentPassword = formData.get("currentPassword") as string;
        const newPassword = formData.get("newPassword") as string;
        const confirmPassword = formData.get("confirmPassword") as string;

        try {
            const result = await changePassword({
                currentPassword,
                newPassword,
                confirmPassword
            });

            if (result?.error) {
                setError(result.error);
            } else if (result?.success) {
                setSuccess(result.success);
                (e.target as HTMLFormElement).reset();
            }
        } catch (err: any) {
            setError(err.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    }

    const togglePassword = (field: keyof typeof showPasswords) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    return (
        <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-50 relative overflow-hidden">
            <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-sm">
                        <Lock size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900">Change Password</h2>
                        <p className="text-slate-500 font-medium text-sm">Update your account credentials to stay secure.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
                    {/* Current Password */}
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Current Password</label>
                        <div className="relative group">
                            <input
                                name="currentPassword"
                                type={showPasswords.current ? "text" : "password"}
                                required
                                placeholder="••••••••"
                                className="w-full h-14 pl-12 pr-12 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-indigo-500/20 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none text-slate-900 font-semibold"
                            />
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                            <button
                                type="button"
                                onClick={() => togglePassword('current')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* New Password */}
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">New Password</label>
                            <div className="relative group">
                                <input
                                    name="newPassword"
                                    type={showPasswords.new ? "text" : "password"}
                                    required
                                    placeholder="••••••••"
                                    className="w-full h-14 pl-12 pr-12 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-indigo-500/20 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none text-slate-900 font-semibold"
                                />
                                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                                <button
                                    type="button"
                                    onClick={() => togglePassword('new')}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Confirm New Password</label>
                            <div className="relative group">
                                <input
                                    name="confirmPassword"
                                    type={showPasswords.confirm ? "text" : "password"}
                                    required
                                    placeholder="••••••••"
                                    className="w-full h-14 pl-12 pr-12 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-indigo-500/20 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none text-slate-900 font-semibold"
                                />
                                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                                <button
                                    type="button"
                                    onClick={() => togglePassword('confirm')}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-bold animate-in fade-in slide-in-from-top-2">
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-600 text-sm font-bold animate-in fade-in slide-in-from-top-2">
                            <ShieldCheck size={18} />
                            {success}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-black rounded-2xl shadow-lg shadow-indigo-100 transition-all hover:-translate-y-1 active:translate-y-0"
                    >
                        {loading ? "Updating..." : "Update Password"}
                    </button>
                </form>
            </div>

            <div className="absolute right-0 bottom-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-30 translate-x-1/2 translate-y-1/2" />
        </div>
    );
}


