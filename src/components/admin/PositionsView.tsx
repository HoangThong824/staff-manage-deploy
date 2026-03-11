import { Briefcase, Trash2, Calendar, Search, DollarSign, Building2 } from "lucide-react";
import { useState } from "react";
import { useData } from "@/context/DataContext";

export function PositionsView({ positions }: { positions: any[] }) {
    const [searchQuery, setSearchQuery] = useState("");
    const { deletePosition, createHistory, session } = useData();

    const filteredPositions = positions.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.departmentName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDelete = async (id: string, title: string) => {
        if (confirm(`Are you sure you want to archive the institutional role "${title}"? This action cannot be undone if there are no associated faculty.`)) {
            try {
                await deletePosition(id);

                // Log history
                if (session?.user) {
                    await createHistory({
                        action: "Archived Position",
                        details: `Removed institutional role: ${title}`,
                        userId: session.user.id,
                        userName: session.user.name || session.user.email,
                        targetId: id,
                        targetName: title,
                        type: 'SYSTEM'
                    });
                }
            } catch (error: any) {
                alert(error.message || "Failed to archive position");
            }
        }
    };


    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
            {/* Search Bar */}
            <div className="relative max-w-md group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={20} />
                <input
                    type="text"
                    placeholder="Search roles or departments..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none font-medium"
                />
            </div>

            {filteredPositions.length === 0 ? (
                <div className="bg-white p-20 rounded-[2.5rem] border border-dashed border-slate-200 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                        <Briefcase size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">No positions discovered</h3>
                    <p className="text-slate-400 max-w-xs mx-auto font-medium">Refine your search parameters or establish a new institutional role.</p>
                </div>
            ) : (
                <div className="space-y-12">
                    {(Object.entries(
                        filteredPositions.reduce((acc, pos: any) => {
                            if (!acc[pos.departmentName]) acc[pos.departmentName] = [];
                            acc[pos.departmentName].push(pos);
                            return acc;
                        }, {} as Record<string, any[]>)
                    ) as [string, any[]][]).map(([deptName, deptPositions]) => (
                        <div key={deptName} className="space-y-6">
                            <div className="flex items-center gap-4 px-2">
                                <div className="h-px flex-1 bg-slate-100" />
                                <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                                    <Building2 size={14} className="text-emerald-500" />
                                    {deptName}
                                    <span className="text-emerald-600/40 ml-1">({deptPositions.length})</span>
                                </h2>
                                <div className="h-px flex-1 bg-slate-100" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {deptPositions.map((pos: any) => (
                                    <div key={pos.id} className="group p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-500 relative overflow-hidden">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform duration-500 shadow-sm">
                                                <Briefcase size={20} />
                                            </div>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleDelete(pos.id, pos.title)}
                                                    className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                                    title="Archive Position"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>

                                        <h3 className="text-lg font-black text-slate-800 mb-4 group-hover:text-emerald-600 transition-colors tracking-tight">
                                            {pos.title}
                                        </h3>

                                        <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50/50 rounded-xl border border-slate-100 group-hover:bg-white transition-colors duration-500">
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Salary Range</p>
                                                <p className="text-xs font-black text-slate-700 flex items-center">
                                                    <DollarSign size={12} className="text-emerald-500 mr-0.5" />
                                                    {pos.salaryMin?.toLocaleString() || '0'} - {pos.salaryMax?.toLocaleString() || '∞'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Updated</p>
                                                <p className="text-xs font-black text-slate-700 flex items-center">
                                                    <Calendar size={12} className="text-slate-300 mr-1" />
                                                    {new Date(pos.updatedAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Visual flair */}
                                        <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-50/20 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-emerald-100/40 transition-colors duration-500" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
