import { useState } from "react";
import { Plus, X, Briefcase, Loader2, DollarSign } from "lucide-react";
import { useData } from "@/context/DataContext";

export function AddPositionForm({ departments }: { departments: any[] }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { createPosition, createHistory, session } = useData();
    const [formData, setFormData] = useState({
        title: "",
        departmentId: departments[0]?.id || "",
        salaryMin: "",
        salaryMax: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const pos = await createPosition({
                title: formData.title,
                departmentId: formData.departmentId,
                salaryMin: formData.salaryMin ? Number(formData.salaryMin) : null,
                salaryMax: formData.salaryMax ? Number(formData.salaryMax) : null,
            });

            // Log history
            if (session?.user) {
                const dept = departments.find(d => d.id === formData.departmentId);
                await createHistory({
                    action: "Created Position",
                    details: `Added new position: ${formData.title} in ${dept?.name || 'Unknown'}`,
                    userId: session.user.id,
                    userName: session.user.name || session.user.email,
                    targetId: pos.id,
                    targetName: formData.title,
                    type: 'SYSTEM'
                });
            }

            setIsOpen(false);
            setFormData({
                title: "",
                departmentId: departments[0]?.id || "",
                salaryMin: "",
                salaryMax: ""
            });
        } catch (error) {
            console.error(error);
            alert("Failed to create position");
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 rounded-2xl text-white font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 group"
            >
                <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                Add Position
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                                    <Briefcase size={20} />
                                </div>
                                <h2 className="text-xl font-bold text-slate-800">New Academic Position</h2>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 px-1">Position Title</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="e.g., Senior Faculty"
                                        className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium placeholder:text-slate-300"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 px-1">Academic Department</label>
                                    <select
                                        required
                                        value={formData.departmentId}
                                        onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                                        className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium appearance-none"
                                    >
                                        {departments.map(dept => (
                                            <option key={dept.id} value={dept.id}>{dept.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 px-1">Min Salary (Annual)</label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                            <input
                                                type="number"
                                                value={formData.salaryMin}
                                                onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
                                                placeholder="0.00"
                                                className="w-full pl-10 pr-5 py-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium placeholder:text-slate-300"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 px-1">Max Salary (Annual)</label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                            <input
                                                type="number"
                                                value={formData.salaryMax}
                                                onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
                                                placeholder="0.00"
                                                className="w-full pl-10 pr-5 py-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium placeholder:text-slate-300"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    disabled={isLoading}
                                    type="submit"
                                    className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                                >
                                    {isLoading ? (
                                        <Loader2 size={20} className="animate-spin" />
                                    ) : (
                                        "Broadcast Opening"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
