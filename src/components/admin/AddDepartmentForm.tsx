import { useState } from "react";
import { Plus, X, Building2, Loader2 } from "lucide-react";
import { useData } from "@/context/DataContext";

export function AddDepartmentForm() {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [name, setName] = useState("");
    const { createDepartment, createHistory, session } = useData();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const dept = await createDepartment(name);

            // Log history
            if (session?.user) {
                await createHistory({
                    action: "Created Department",
                    details: `Added new department: ${name}`,
                    userId: session.user.id,
                    userName: session.user.name || session.user.email,
                    targetId: dept.id,
                    targetName: name,
                    type: 'SYSTEM'
                });
            }

            setIsOpen(false);
            setName("");
        } catch (error) {
            console.error(error);
            alert("Failed to create department");
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 rounded-2xl text-white font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 group"
            >
                <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                Add Department
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                                    <Building2 size={20} />
                                </div>
                                <h2 className="text-xl font-bold text-slate-800">New Department</h2>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div>
                                <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 px-1">Department Name</label>
                                <input
                                    required
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g., Computer Science"
                                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium placeholder:text-slate-300"
                                />
                            </div>

                            <div className="pt-2">
                                <button
                                    disabled={isLoading}
                                    type="submit"
                                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                                >
                                    {isLoading ? (
                                        <Loader2 size={20} className="animate-spin" />
                                    ) : (
                                        "Initialize Department"
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
