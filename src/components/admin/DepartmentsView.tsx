import { Building2, Trash2, Calendar, Search } from "lucide-react";
import { useState } from "react";
import { useData } from "@/context/DataContext";

export function DepartmentsView({ departments }: { departments: any[] }) {
    const [searchQuery, setSearchQuery] = useState("");
    const { deleteDepartment, createHistory, session } = useData();

    const filteredDepartments = departments.filter(d =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDelete = async (id: string, name: string) => {
        if (confirm(`Are you sure you want to delete the department "${name}"? This will also affect related positions and faculty assignments.`)) {
            try {
                await deleteDepartment(id);

                // Log history
                if (session?.user) {
                    await createHistory({
                        action: "Deleted Department",
                        details: `Removed department: ${name}`,
                        userId: session.user.id,
                        userName: session.user.name || session.user.email,
                        targetId: id,
                        targetName: name,
                        type: 'SYSTEM'
                    });
                }
            } catch (error: any) {
                alert(error.message || "Failed to delete department");
            }
        }
    };


    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
            {/* Search Bar */}
            <div className="relative max-w-md group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                <input
                    type="text"
                    placeholder="Search departments..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none font-medium"
                />
            </div>

            {filteredDepartments.length === 0 ? (
                <div className="bg-white p-20 rounded-[2.5rem] border border-dashed border-slate-200 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                        <Building2 size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">No departments found</h3>
                    <p className="text-slate-400 max-w-xs mx-auto font-medium">Try adjusting your search or add a new department to get started.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredDepartments.map((dept) => (
                        <div key={dept.id} className="group p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-500 overflow-hidden">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:scale-110 transition-transform duration-500 shadow-sm">
                                    <Building2 size={26} />
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleDelete(dept.id, dept.name)}
                                        className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                        title="Delete Department"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            <h3 className="text-2xl font-black text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">
                                {dept.name}
                            </h3>

                            <div className="mt-8 pt-8 border-t border-slate-50 flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <Calendar size={14} className="mr-2 text-indigo-400" />
                                Established {new Date(dept.createdAt).toLocaleDateString()}
                            </div>

                            {/* Decorative elements */}
                            <div className="absolute right-0 bottom-0 w-32 h-32 bg-indigo-50/30 rounded-full blur-3xl -mr-16 -mb-16 group-hover:bg-indigo-100/50 transition-colors duration-500" />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
