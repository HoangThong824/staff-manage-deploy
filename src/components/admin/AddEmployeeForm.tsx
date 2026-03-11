import { useState, useMemo } from "react";
import { Plus, X, Users, Loader2, Building2, Briefcase, Mail, UserPlus, Search, CheckCircle2 } from "lucide-react";
import { useData } from "@/context/DataContext";
import { Employee, Department, Position } from "@/lib/db";


interface AddEmployeeFormProps {
    employees?: Employee[];
    departments: Department[];
    positions: any[];
    onSuccess?: () => void;
}

export function AddEmployeeForm({ employees = [], departments, positions, onSuccess }: AddEmployeeFormProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [selectedDeptId, setSelectedDeptId] = useState(departments[0]?.id || "");
    const [positionId, setPositionId] = useState("");
    const [isCustomPosition, setIsCustomPosition] = useState(false);
    const [customPositionTitle, setCustomPositionTitle] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    const { createEmployee, createUser, createHistory, createPosition, session } = useData();

    // Reset position state when department changes
    const onDeptChange = (deptId: string) => {
        setSelectedDeptId(deptId);
        setPositionId("");
        setIsCustomPosition(false);
        setCustomPositionTitle("");
        setSearchTerm("");
    };

    const filteredPositions = useMemo(() => {
        if (!selectedDeptId) return [];
        return positions
            .filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [positions, selectedDeptId, searchTerm]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const firstName = formData.get("firstName") as string;
        const lastName = formData.get("lastName") as string;
        const email = formData.get("email") as string;
        const departmentId = formData.get("departmentId") as string;
        const managerId = formData.get("managerId") as string || null;

        try {
            if (!positionId && !isCustomPosition) {
                throw new Error("Please select a position or create a new one");
            }

            let finalPositionId = positionId;
            let finalPositionTitle = "";

            // 1. Handle Custom Position creation if selected
            if (isCustomPosition) {
                const title = customPositionTitle.trim() || searchTerm.trim();
                if (!title) {
                    throw new Error("Please specify a position title");
                }

                // Double check if position already exists in this department
                const existingPos = positions.find(p =>
                    p.departmentId === departmentId &&
                    p.title.toLowerCase() === title.toLowerCase()
                );

                if (existingPos) {
                    finalPositionId = existingPos.id;
                    finalPositionTitle = existingPos.title;
                } else {
                    const newPos = await createPosition({
                        title: title,
                        departmentId: departmentId,
                        salaryMin: null,
                        salaryMax: null
                    });
                    finalPositionId = newPos.id;
                    finalPositionTitle = newPos.title;
                }
            } else {
                const pos = positions.find(p => p.id === positionId);
                finalPositionTitle = pos?.title || "Unknown";
            }

            // 2. Create Employee
            const employee = await createEmployee({
                firstName,
                lastName,
                email,
                positionId: finalPositionId,
                departmentId,
                managerId,
            });

            // 3. Create User account
            await createUser({
                email,
                password: "123",
                name: `${firstName} ${lastName}`,
                employeeId: employee.id,
                role: "EMPLOYEE"
            });

            // 4. Log History
            if (session?.user) {
                await createHistory({
                    action: "Added new faculty member",
                    details: `Added ${firstName} ${lastName} as ${finalPositionTitle}`,
                    userId: session.user.id,
                    userName: session.user.name || session.user.email,
                    targetId: employee.id,
                    targetName: `${firstName} ${lastName}`,
                    type: 'EMPLOYEE'
                });
            }

            setIsOpen(false);
            if (onSuccess) onSuccess();

            // Reset local state
            setPositionId("");
            setIsCustomPosition(false);
            setCustomPositionTitle("");
            setSearchTerm("");
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred");
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
                <UserPlus size={20} className="group-hover:scale-110 transition-transform" />
                Add Employee
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
                        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30 flex-shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                                    <Users size={20} />
                                </div>
                                <h2 className="text-xl font-bold text-slate-800">Recruit New Faculty</h2>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col flex-grow overflow-hidden">
                            <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar flex-grow">
                                {error && (
                                    <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-sm font-bold animate-in slide-in-from-top-2">
                                        {error}
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 px-1">First Name</label>
                                        <input
                                            required
                                            name="firstName"
                                            type="text"
                                            placeholder="John"
                                            className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 px-1">Last Name</label>
                                        <input
                                            required
                                            name="lastName"
                                            type="text"
                                            placeholder="Doe"
                                            className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 px-1">Institutional Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                        <input
                                            required
                                            name="email"
                                            type="email"
                                            placeholder="john.doe@university.edu"
                                            className="w-full pl-14 pr-5 py-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 px-1">Academic Department</label>
                                    <div className="relative">
                                        <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                        <select
                                            required
                                            name="departmentId"
                                            value={selectedDeptId}
                                            onChange={(e) => onDeptChange(e.target.value)}
                                            className="w-full pl-14 pr-5 py-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium appearance-none"
                                        >
                                            <option value="" disabled>Select Department</option>
                                            {departments.map(dept => (
                                                <option key={dept.id} value={dept.id}>{dept.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 px-1">Choose or Create Position</label>

                                    <div className="relative">
                                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                        <input
                                            type="text"
                                            placeholder="Search or enter new position..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-14 pr-5 py-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                                            disabled={!selectedDeptId}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 max-h-[200px] overflow-y-auto custom-scrollbar p-1">
                                        {filteredPositions.map(pos => (
                                            <button
                                                key={pos.id}
                                                type="button"
                                                onClick={() => {
                                                    setPositionId(pos.id);
                                                    setIsCustomPosition(false);
                                                    setCustomPositionTitle("");
                                                }}
                                                className={`p-4 rounded-2xl text-left transition-all border-2 flex items-start justify-between group ${positionId === pos.id
                                                    ? "bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm"
                                                    : "bg-white border-slate-100 text-slate-600 hover:border-slate-200"}`}
                                            >
                                                <div className="space-y-1">
                                                    <p className="text-sm font-bold leading-tight">{pos.title}</p>
                                                    <p className="text-[10px] text-slate-400 font-medium">Standard Position</p>
                                                </div>
                                                {positionId === pos.id && <CheckCircle2 size={16} className="text-indigo-600 flex-shrink-0" />}
                                            </button>
                                        ))}

                                        {searchTerm.trim() && !filteredPositions.some(p => p.title.toLowerCase() === searchTerm.trim().toLowerCase()) && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsCustomPosition(true);
                                                    setPositionId("");
                                                    setCustomPositionTitle(searchTerm.trim());
                                                }}
                                                className={`p-4 rounded-2xl text-left transition-all border-2 border-dashed flex flex-col gap-1 ${isCustomPosition
                                                    ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                                                    : "bg-slate-50/50 border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300"}`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Plus size={14} className={isCustomPosition ? "text-emerald-500" : "text-slate-400"} />
                                                    <p className="text-sm font-bold">Add Custom</p>
                                                </div>
                                                <p className="text-xs italic truncate font-medium">"{searchTerm.trim()}"</p>
                                                {isCustomPosition && <div className="mt-auto self-end"><CheckCircle2 size={16} className="text-emerald-600" /></div>}
                                            </button>
                                        )}

                                        {!filteredPositions.length && !searchTerm.trim() && (
                                            <div className="col-span-2 py-8 text-center bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100">
                                                <Briefcase className="mx-auto text-slate-200 mb-2" size={32} />
                                                <p className="text-slate-400 text-sm font-medium">No positions in this department yet</p>
                                                <p className="text-[10px] text-slate-300 font-bold uppercase tracking-wider mt-1">Search to create one</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 px-1">Direct Supervisor</label>
                                    <select
                                        name="managerId"
                                        className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium appearance-none"
                                    >
                                        <option value="">Independent Faculty / Senior Board</option>
                                        {employees.map(emp => (
                                            <option key={emp.id} value={emp.id}>
                                                {emp.firstName} {emp.lastName} ({(emp as any).positionName})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <p className="text-[10px] text-slate-400 font-bold bg-slate-50 p-4 rounded-xl border border-dashed border-slate-200 flex-shrink-0">
                                    <span className="text-indigo-600 font-black tracking-widest uppercase text-[9px] block mb-1">Security Note</span>
                                    Upon initialization, a system account will be generated automatically. The temporary credential will be set to <code className="text-indigo-600 bg-indigo-50 px-1 rounded">123</code> (standard demo password).
                                </p>
                            </div>

                            <div className="p-8 border-t border-slate-50 flex gap-4 bg-slate-50/10 flex-shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="flex-1 py-4 border border-slate-200 text-slate-500 rounded-2xl font-bold hover:bg-slate-50 transition-all text-sm"
                                >
                                    Dismiss
                                </button>
                                <button
                                    disabled={isLoading}
                                    type="submit"
                                    className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 disabled:opacity-50 group"
                                >
                                    {isLoading ? (
                                        <Loader2 size={20} className="animate-spin" />
                                    ) : (
                                        <>Finalize Onboarding <Plus size={18} className="group-hover:scale-110 transition-transform" /></>
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
