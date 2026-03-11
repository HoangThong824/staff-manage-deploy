import { Building2, Trash2, Calendar, Search, Users, X, Mail, Briefcase, ExternalLink, ArrowRight } from "lucide-react";
import { useState, useMemo } from "react";
import { useData } from "@/context/DataContext";
import Link from "next/link";

export function DepartmentsView({ departments, employees, positions }: { departments: any[], employees: any[], positions: any[] }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null);
    const { deleteDepartment, createHistory, session } = useData();

    const filteredDepartments = departments.filter(d =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const selectedDept = departments.find(d => d.id === selectedDeptId);
    const deptEmployees = useMemo(() => {
        if (!selectedDeptId) return [];
        return employees.filter(e => e.departmentId === selectedDeptId);
    }, [employees, selectedDeptId]);

    const handleDelete = async (e: React.MouseEvent, id: string, name: string) => {
        e.stopPropagation();
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
                        <div 
                            key={dept.id} 
                            onClick={() => setSelectedDeptId(dept.id)}
                            className="group p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 overflow-hidden cursor-pointer relative"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:scale-110 transition-transform duration-500 shadow-sm relative z-10">
                                    <Building2 size={26} />
                                </div>
                                <div className="relative z-20">
                                    <button
                                        onClick={(e) => handleDelete(e, dept.id, dept.name)}
                                        className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                        title="Delete Department"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="relative z-10">
                                <h3 className="text-2xl font-black text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">
                                    {dept.name}
                                </h3>
                                
                                <div className="flex items-center gap-2 mt-4 text-slate-500 font-bold text-sm">
                                    <Users size={16} className="text-indigo-400" />
                                    <span>{employees.filter(e => e.departmentId === dept.id).length} Staff Members</span>
                                </div>

                                <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    <div className="flex items-center">
                                        <Calendar size={14} className="mr-2 text-indigo-400" />
                                        Since {new Date(dept.createdAt).toLocaleDateString()}
                                    </div>
                                    <ArrowRight size={16} className="text-indigo-600 opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0" />
                                </div>
                            </div>

                            {/* Decorative elements */}
                            <div className="absolute right-0 bottom-0 w-32 h-32 bg-indigo-50/30 rounded-full blur-3xl -mr-16 -mb-16 group-hover:bg-indigo-100/50 transition-colors duration-500 z-0" />
                        </div>
                    ))}
                </div>
            )}

            {/* Staff Modal */}
            {selectedDeptId && selectedDept && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[85vh]">
                        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30 flex-shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100 scale-110">
                                    <Building2 size={24} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-indigo-500 tracking-[0.2em] mb-0.5">Academic Faculty</p>
                                    <h2 className="text-2xl font-black text-slate-900">{selectedDept.name}</h2>
                                </div>
                            </div>
                            <button 
                                onClick={() => setSelectedDeptId(null)} 
                                className="w-12 h-12 flex items-center justify-center bg-white border border-slate-100 text-slate-400 hover:text-slate-900 hover:border-slate-200 rounded-2xl transition-all shadow-sm hover:shadow-md"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-8 overflow-y-auto custom-scrollbar flex-grow bg-slate-50/20">
                            {deptEmployees.length === 0 ? (
                                <div className="py-20 text-center">
                                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100">
                                        <Users size={32} className="text-slate-200" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800 mb-2">No staff members listed</h3>
                                    <p className="text-slate-400 max-w-xs mx-auto font-medium">There are currently no faculty members assigned to this department.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {deptEmployees.map((emp) => (
                                        <div key={emp.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 group flex items-start gap-4">
                                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-50 to-indigo-100 text-indigo-600 flex items-center justify-center font-black text-lg group-hover:scale-110 transition-transform duration-300 uppercase flex-shrink-0">
                                                {(emp.firstName?.[0] || "") + (emp.lastName?.[0] || "")}
                                            </div>
                                            <div className="flex-grow min-w-0">
                                                <div className="flex justify-between items-start">
                                                    <h4 className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                                                        {emp.firstName} {emp.lastName}
                                                    </h4>
                                                    <Link 
                                                        href={`/tasks/manage/${emp.id}`}
                                                        className="p-2 text-slate-300 hover:text-indigo-600 transition-colors"
                                                        title="Manage Tasks"
                                                    >
                                                        <ExternalLink size={14} />
                                                    </Link>
                                                </div>
                                                <div className="mt-2 space-y-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-tight">
                                                    <div className="flex items-center gap-2">
                                                        <Briefcase size={12} className="text-indigo-400" />
                                                        <span className="truncate">{emp.positionName || "Unknown Position"}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Mail size={12} className="text-violet-400" />
                                                        <span className="truncate lowercase">{emp.email}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-8 border-t border-slate-50 bg-white flex justify-end flex-shrink-0">
                            <button
                                onClick={() => setSelectedDeptId(null)}
                                className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100/50"
                            >
                                Return to Departments
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
