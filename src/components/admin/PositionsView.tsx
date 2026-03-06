"use client";

import { Briefcase, Trash2, Calendar, Search, Tag, DollarSign, Building2 } from "lucide-react";
import { deletePosition } from "@/actions/position";
import { useState } from "react";

export function PositionsView({ positions }: { positions: any[] }) {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredPositions = positions.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.departmentName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDelete = async (id: string, title: string) => {
        if (confirm(`Are you sure you want to delete the position "${title}"?`)) {
            try {
                await deletePosition(id);
            } catch (error: any) {
                alert(error.message || "Failed to delete position");
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {filteredPositions.map((pos) => (
                        <div key={pos.id} className="group p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:shadow-emerald-500/5 transition-all duration-500">

                            <div className="flex justify-between items-start mb-6">
                                <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:scale-110 transition-transform duration-500 shadow-sm">
                                    <Briefcase size={26} />
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleDelete(pos.id, pos.title)}
                                        className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                        title="Archive Position"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            <h3 className="text-2xl font-black text-slate-800 mb-2 group-hover:text-emerald-600 transition-colors tracking-tight">
                                {pos.title}
                            </h3>

                            <div className="flex items-center gap-2 mb-8">
                                <div className="flex items-center gap-1.5 text-[10px] font-black text-violet-600 bg-violet-50 px-3 py-1.5 rounded-full border border-violet-100 uppercase tracking-widest">
                                    <Building2 size={12} />
                                    {pos.departmentName}
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 uppercase tracking-widest">
                                    Active Opening
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6 p-6 bg-slate-50/50 rounded-2xl border border-slate-100 group-hover:bg-white transition-colors duration-500">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Compensation</p>
                                    <p className="text-sm font-black text-slate-700 flex items-center">
                                        <DollarSign size={14} className="text-emerald-500 mr-0.5" />
                                        {pos.salaryMin?.toLocaleString() || '0'} - {pos.salaryMax?.toLocaleString() || '∞'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Last Updated</p>
                                    <p className="text-sm font-black text-slate-700 flex items-center">
                                        <Calendar size={14} className="text-slate-300 mr-1.5" />
                                        {new Date(pos.updatedAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            {/* Visual flair */}
                            <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-50/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-emerald-100/40 transition-colors duration-500" />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
