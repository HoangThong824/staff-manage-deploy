"use client";

import { useState } from "react";
import { Plus, X, Users, Loader2, Building2, Briefcase, Mail, UserPlus } from "lucide-react";
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
    const { createEmployee, createUser, createHistory, session } = useData();

    const filteredPositions = positions.filter(p => p.departmentId === selectedDeptId);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const firstName = formData.get("firstName") as string;
        const lastName = formData.get("lastName") as string;
        const email = formData.get("email") as string;
        const positionId = formData.get("positionId") as string;
        const departmentId = formData.get("departmentId") as string;
        const managerId = formData.get("managerId") as string || null;

        try {
            // 1. Create Employee
            const employee = await createEmployee({
                firstName,
                lastName,
                email,
                positionId,
                departmentId,
                managerId,
            });

            // 2. Create User account
            await createUser({
                email,
                password: "123456",
                name: `${firstName} ${lastName}`,
                employeeId: employee.id,
                role: "EMPLOYEE"
            });

            // 3. Log History
            if (session?.user) {
                const pos = positions.find(p => p.id === positionId);
                await createHistory({
                    action: "Added new faculty member",
                    details: `Added ${firstName} ${lastName} as ${pos?.title || 'Unknown'}`,
                    userId: session.user.id,
                    userName: session.user.name || session.user.email,
                    targetId: employee.id,
                    targetName: `${firstName} ${lastName}`,
                    type: 'EMPLOYEE'
                });
            }

            setIsOpen(false);
            if (onSuccess) onSuccess();
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
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
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

                        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
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

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 px-1">Academic Department</label>
                                    <div className="relative">
                                        <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                        <select
                                            required
                                            name="departmentId"
                                            value={selectedDeptId}
                                            onChange={(e) => setSelectedDeptId(e.target.value)}
                                            className="w-full pl-14 pr-5 py-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium appearance-none"
                                        >
                                            <option value="" disabled>Select Department</option>
                                            {departments.map(dept => (
                                                <option key={dept.id} value={dept.id}>{dept.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 px-1">Assigned Position</label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                        <select
                                            required
                                            name="positionId"
                                            className="w-full pl-14 pr-5 py-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium appearance-none disabled:opacity-50"
                                            disabled={!selectedDeptId}
                                        >
                                            <option value="" disabled>Select Position</option>
                                            {positions.map(pos => (
                                                <option key={pos.id} value={pos.id}>{pos.title}</option>
                                            ))}
                                        </select>
                                    </div>
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

                            <p className="text-[10px] text-slate-400 font-bold bg-slate-50 p-4 rounded-xl border border-dashed border-slate-200">
                                <span className="text-indigo-600 font-black tracking-widest uppercase text-[9px] block mb-1">Security Note</span>
                                Upon initialization, a system account will be generated automatically. The temporary credential will be set to <code className="text-indigo-600 bg-indigo-50 px-1 rounded">123456</code>.
                            </p>

                            <div className="pt-4 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="flex-1 py-4 border border-slate-200 text-slate-500 rounded-2xl font-bold hover:bg-slate-50 transition-all text-sm"
                                >
                                    Dismis
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
