"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Settings } from "lucide-react";
import { ChangePasswordForm } from "@/components/auth/ChangePasswordForm";
import { useData } from "@/context/DataContext";

export default function SettingsPage() {
    const { session, loading } = useData();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !session) {
            router.push("/login");
        }
    }, [session, loading, router]);

    if (loading || !session) return <div className="p-10 text-center font-bold">Loading Settings...</div>;

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-50 relative overflow-hidden group">
                <div className="relative z-10">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Account Settings</h1>
                    <p className="text-slate-500 text-lg mt-2 font-medium">Manage your profile, security, and preferences.</p>
                </div>
                <div className="absolute right-0 top-0 w-64 h-64 bg-violet-50 rounded-full blur-3xl opacity-50 group-hover:opacity-80 transition-opacity translate-x-1/2 -translate-y-1/2" />
            </div>

            <div className="max-w-4xl">
                <ChangePasswordForm />
            </div>
        </div>
    );
}
