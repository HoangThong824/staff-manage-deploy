import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { History } from "lucide-react";
import db from "@/lib/db";
import { HistoryTable } from "@/components/admin/HistoryTable";

export default async function HistoryPage() {
    const session = await getSession();
    if (!session || session.user.role !== "ADMIN") {
        redirect("/");
    }

    const history = await db.history.findMany();

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-50 relative overflow-hidden group">
                <div className="relative z-10">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-500">Academic History</h1>
                    <p className="text-slate-500 text-lg mt-2 font-medium">Real-time audit log of all institutional activities and changes.</p>
                </div>
                <div className="absolute right-0 top-0 w-64 h-64 bg-amber-50 rounded-full blur-3xl opacity-50 group-hover:opacity-80 transition-opacity translate-x-1/2 -translate-y-1/2" />
            </div>

            <HistoryTable history={history as any} />
        </div>
    );
}
