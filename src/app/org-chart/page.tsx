"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Network } from "lucide-react";
import { useData } from "@/context/DataContext";
import { OrgChart } from "@/components/org/OrgChart";

export default function OrgChartPage() {
    const { session, loading, data, getSubordinates } = useData();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !session) {
            router.push("/login");
            return;
        }
    }, [session, loading, router]);

    // Permission: Admin can view all. Managers (having subordinates) can view as well.
    useEffect(() => {
        async function checkPermission() {
            if (!session?.user) return;
            if (session.user.role === "ADMIN") return;
            if (!session.user.employeeId) {
                router.push("/");
                return;
            }
            const subs = await getSubordinates(session.user.employeeId);
            if (subs.length === 0) router.push("/");
        }
        if (!loading && session) checkPermission();
    }, [loading, session, getSubordinates, router]);

    if (loading || !session) return <div className="p-10 text-center font-bold">Loading Org Chart...</div>;

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-50 relative overflow-hidden group">
                <div className="relative z-10">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Organization Chart</h1>
                    <p className="text-slate-500 text-lg mt-2 font-medium">
                        Visualize manager–subordinate relationships across the institution.
                    </p>
                </div>
                <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 group-hover:opacity-80 transition-opacity translate-x-1/2 -translate-y-1/2" />
                <div className="relative z-10 w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-lg">
                    <Network size={22} />
                </div>
            </div>

            <OrgChart
                employees={data.employees}
                positions={data.positions}
                departments={data.departments}
            />
        </div>
    );
}

