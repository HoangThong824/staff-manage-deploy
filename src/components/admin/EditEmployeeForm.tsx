"use client";

import { useState, useEffect } from "react";
import { X, Users, Loader2, Building2, Briefcase, Mail, Edit, Save, UserMinus, UserPlus } from "lucide-react";
import { useData } from "@/context/DataContext";
import { Employee, Department, Position } from "@/lib/db";
import { cn } from "@/lib/utils";

interface EditEmployeeFormProps {
    employee: Employee;
    allEmployees: Employee[];
    departments: Department[];
    positions: any[];
    onSuccess?: () => void;
}

/**
 * EditEmployeeForm: Modal form to update an employee profile and reporting lines.
 * - Updates `employees` table (name/email/department/position/manager)
 * - Keeps `users` table in sync when employee email/name changes
 * - Logs audit history for traceability
 * - Prevents circular manager relationships by excluding self/descendants
 */
export function EditEmployeeForm({ employee, allEmployees, departments, positions, onSuccess }: EditEmployeeFormProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // Form state
    const [formData, setFormData] = useState({
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        departmentId: employee.departmentId,
        positionId: employee.positionId,
        managerId: employee.managerId || "",
    });

    const { updateEmployee, createHistory, session, updateUser, data, createPosition, getPositions } = useData();
    const [isNewPositionNeeded, setIsNewPositionNeeded] = useState(false);

    const isAdmin = session?.user?.role === 'ADMIN';

    // Effect to auto-sync department with manager
    useEffect(() => {
        if (formData.managerId && !isAdmin) {
            const manager = allEmployees.find(e => e.id === formData.managerId);
            if (manager && manager.departmentId && manager.departmentId !== formData.departmentId) {
                setFormData(prev => ({ ...prev, departmentId: manager.departmentId }));
            }
        }
    }, [formData.managerId, allEmployees, formData.departmentId, isAdmin]);

    // Effect to validate/reset position when department changes
    useEffect(() => {
        const currentPos = positions.find(p => p.id === formData.positionId);
        if (currentPos && currentPos.departmentId !== formData.departmentId) {
            // Position is no longer valid for this department
            // Try to find a position with same title in new department
            const matchingPos = positions.find(p => p.departmentId === formData.departmentId && p.title === currentPos.title);
            if (matchingPos) {
                setFormData(prev => ({ ...prev, positionId: matchingPos.id }));
                setIsNewPositionNeeded(false);
            } else {
                // We will create this position on save
                setIsNewPositionNeeded(true);
            }
        } else if (currentPos && currentPos.departmentId === formData.departmentId) {
            setIsNewPositionNeeded(false);
        }
    }, [formData.departmentId, positions, formData.positionId]);

    // Direct reports of the current employee (used for subordinate management UI).
    const currentSubordinates = allEmployees.filter(emp => emp.managerId === employee.id);

    /**
     * Circular Dependency Protection:
     * This logic identifies all managers that would cause a management loop.
     * An employee cannot be managed by themselves OR any of their own descendants.
     */
    const [invalidManagerIds, setInvalidManagerIds] = useState<Set<string>>(new Set([employee.id]));

    useEffect(() => {
        /**
         * Breadth-First Search (BFS) Algorithm:
         * Traverses the organizational hierarchy downwards starting from the current employee.
         * All discovered employees (descendants) are added to the 'invalid' set.
         */
        const descendants = new Set<string>([employee.id]);
        const stack = [employee.id];

        while (stack.length > 0) {
            const currentId = stack.pop()!;
            // Identify employees whose current manager is 'currentId'
            const directSubs = allEmployees.filter(emp => emp.managerId === currentId);
            directSubs.forEach(sub => {
                if (!descendants.has(sub.id)) {
                    descendants.add(sub.id);
                    stack.push(sub.id);
                }
            });
        }
        setInvalidManagerIds(descendants);
    }, [allEmployees, employee.id]);

    // Note for UI: Descendants are filtered out of the 'Select Manager' dropdown to prevent loops.

    /**
     * handleChange: Generic form handler for inputs/selects.
     * Đồng bộ dữ liệu nhập vào `formData`.
     */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    /**
     * syncSubordinatesDepartment: Propagates department changes down the hierarchy.
     */
    const syncSubordinatesDepartment = async (managerId: string, deptId: string) => {
        const directSubs = allEmployees.filter(e => e.managerId === managerId);
        // Get fresh positions to avoid duplicates in recursive calls
        const latestPositions = await getPositions();
        
        for (const sub of directSubs) {
            const subPos = latestPositions.find(p => p.id === sub.positionId);
            let newPositionId = sub.positionId;
            
            if (subPos && subPos.departmentId !== deptId) {
                let matchingPos = latestPositions.find(p => p.departmentId === deptId && p.title === subPos.title);
                
                if (!matchingPos) {
                    // Auto-create position in target department
                    matchingPos = await createPosition({
                        title: subPos.title,
                        departmentId: deptId,
                        salaryMin: null,
                        salaryMax: null
                    });
                    
                    if (session) {
                        await createHistory({
                            action: "Auto-created position",
                            details: `Created position "${subPos.title}" in ${departments.find(d => d.id === deptId)?.name} during organizational sync`,
                            userId: session.user.id,
                            userName: session.user.name || session.user.email,
                            type: 'EMPLOYEE'
                        });
                    }
                }
                newPositionId = matchingPos.id;
            }

            await updateEmployee(sub.id, { 
                departmentId: deptId,
                positionId: newPositionId
            });
            
            // Recurse with fresh data
            await syncSubordinatesDepartment(sub.id, deptId);
        }
    };

    /**
     * handleSubordinateChange: Assign/unassign an employee as a direct subordinate.
     * - newManagerId = employee.id  -> set as subordinate
     * - newManagerId = null         -> remove reporting line
     * Also writes to history when a session exists.
     */
    const handleSubordinateChange = async (subId: string, newManagerId: string | null) => {
        try {
            await updateEmployee(subId, {
                managerId: newManagerId,
                // If adding as subordinate, auto-sync department
                ...(newManagerId ? { departmentId: employee.departmentId } : {})
            });
            if (session) {
                const sub = allEmployees.find(e => e.id === subId);
                const deptName = departments.find(d => d.id === employee.departmentId)?.name || 'Department';
                await createHistory({
                    action: "Updated subordinate relation",
                    details: newManagerId
                        ? `Set ${employee.firstName} as manager for ${sub?.firstName} ${sub?.lastName} (Inherited ${deptName})`
                        : `Removed ${employee.firstName} as manager for ${sub?.firstName} ${sub?.lastName}`,
                    userId: session.user.id,
                    userName: session.user.name || session.user.email,
                    targetId: subId,
                    type: 'EMPLOYEE'
                });
            }
        } catch (err: any) {
            setError(err.message || "Failed to update subordinate");
        }
    };

    /**
     * handleSubmit: Persist employee profile updates.
     * - Updates employee record
     * - Syncs associated user (if linked by employeeId)
     * - Creates history entry for auditing
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            let finalPositionId = formData.positionId;

            // Handle auto-creation for the main employee if needed
            if (isNewPositionNeeded) {
                const currentPos = positions.find(p => p.id === formData.positionId);
                if (currentPos) {
                    const newPos = await createPosition({
                        title: currentPos.title,
                        departmentId: formData.departmentId,
                        salaryMin: null,
                        salaryMax: null
                    });
                    finalPositionId = newPos.id;

                    if (session) {
                        await createHistory({
                            action: "Auto-created position",
                            details: `Created position "${currentPos.title}" in ${departments.find(d => d.id === formData.departmentId)?.name} for ${formData.firstName} ${formData.lastName}`,
                            userId: session.user.id,
                            userName: session.user.name || session.user.email,
                            type: 'EMPLOYEE'
                        });
                    }
                }
            }

            // Update Employee record
            await updateEmployee(employee.id, {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                departmentId: formData.departmentId,
                positionId: finalPositionId,
                managerId: formData.managerId || null,
            });

            // Recursive sync if department changed
            if (employee.departmentId !== formData.departmentId) {
                await syncSubordinatesDepartment(employee.id, formData.departmentId);
            }

            // Update associated User record if email or name changed
            const associatedUser = data.users.find((u: any) => u.employeeId === employee.id);
            if (associatedUser) {
                await updateUser(associatedUser.id, {
                    email: formData.email,
                    name: `${formData.firstName} ${formData.lastName}`
                });
            }

            // Log History
            if (session?.user) {
                const deptChanged = employee.departmentId !== formData.departmentId;
                await createHistory({
                    action: "Updated faculty member info",
                    details: `Updated info for ${formData.firstName} ${formData.lastName}${deptChanged ? ` (Dept changed to ${departments.find(d => d.id === formData.departmentId)?.name} - Synced subordinates)` : ""}`,
                    userId: session.user.id,
                    userName: session.user.name || session.user.email,
                    targetId: employee.id,
                    targetName: `${formData.firstName} ${formData.lastName}`,
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

    // Positions can be department-scoped; used when a department filter is needed.
    const filteredPositions = positions.filter(p => p.departmentId === formData.departmentId);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                title="Edit Employee"
            >
                <Edit size={18} />
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                                    <Edit size={20} />
                                </div>
                                <h2 className="text-xl font-bold text-slate-800">Edit Faculty Profile</h2>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Form Body */}
                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                            <form id="edit-emp-form" onSubmit={handleSubmit} className="space-y-8">
                                {error && (
                                    <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-sm font-bold animate-in slide-in-from-top-2">
                                        {error}
                                    </div>
                                )}

                                {/* Basic Info */}
                                <div className="space-y-6">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600/50">Basic Information</p>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 px-1">First Name</label>
                                            <input
                                                required
                                                name="firstName"
                                                value={formData.firstName}
                                                onChange={handleChange}
                                                className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 px-1">Last Name</label>
                                            <input
                                                required
                                                name="lastName"
                                                value={formData.lastName}
                                                onChange={handleChange}
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
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="w-full pl-14 pr-5 py-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Organization */}
                                <div className="space-y-6">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600/50">Institutional Placement</p>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 px-1">Department</label>
                                            <div className="relative">
                                                <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                                <select
                                                    required
                                                    name="departmentId"
                                                    value={formData.departmentId}
                                                    onChange={handleChange}
                                                    className="w-full pl-14 pr-5 py-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium appearance-none"
                                                    disabled={!!formData.managerId && !isAdmin}
                                                >
                                                    {departments.map(dept => (
                                                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            {formData.managerId && !isAdmin && (
                                                <p className="mt-2 text-[9px] text-indigo-600 font-bold px-1 uppercase tracking-wider italic">
                                                    Locked: Inherited from manager
                                                </p>
                                            )}
                                            {formData.managerId && isAdmin && (
                                                <p className="mt-2 text-[9px] text-indigo-600 font-bold px-1 uppercase tracking-wider italic">
                                                    Note: Inherited from manager (Admin can override)
                                                </p>
                                            )}
                                            {isNewPositionNeeded && (
                                                <p className="mt-2 text-[9px] text-amber-600 font-bold px-1 uppercase tracking-wider italic font-black">
                                                    Note: Current position will be auto-created in this department.
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 px-1">Position</label>
                                            <div className="relative">
                                                <Briefcase className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                                <select
                                                    required
                                                    name="positionId"
                                                    value={formData.positionId}
                                                    onChange={handleChange}
                                                    className="w-full pl-14 pr-5 py-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium appearance-none"
                                                >
                                                    {positions
                                                        .filter(pos => pos.departmentId === formData.departmentId)
                                                        .map(pos => (
                                                            <option key={pos.id} value={pos.id}>{pos.title}</option>
                                                        ))
                                                    }
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Hierarchy Management */}
                                <div className="space-y-6">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600/50">Hierarchy Management</p>

                                    {/* Direct Supervisor */}
                                    <div>
                                        <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 px-1">Direct Supervisor</label>
                                        <select
                                            name="managerId"
                                            value={formData.managerId}
                                            onChange={handleChange}
                                            className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium appearance-none"
                                        >
                                            <option value="">Independent Faculty / Senior Board</option>
                                            {allEmployees
                                                .filter(emp => !invalidManagerIds.has(emp.id))
                                                .map(emp => (
                                                    <option key={emp.id} value={emp.id}>
                                                        {emp.firstName} {emp.lastName} ({(emp as any).positionName})
                                                    </option>
                                                ))
                                            }
                                        </select>
                                        {invalidManagerIds.size > 1 && (
                                            <p className="mt-2 text-[10px] text-amber-600 font-bold px-1 italic">
                                                Note: Self and subordinates are hidden to prevent circular dependency.
                                            </p>
                                        )}
                                    </div>

                                    {/* Subordinates List */}
                                    <div>
                                        <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-3 px-1">Direct Subordinates ({currentSubordinates.length})</label>
                                        <div className="space-y-2">
                                            {currentSubordinates.length === 0 ? (
                                                <p className="text-xs text-slate-400 italic bg-slate-50 p-4 rounded-2xl border border-dashed border-slate-200">No direct reports assigned yet.</p>
                                            ) : (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {currentSubordinates.map(sub => (
                                                        <div key={sub.id} className="flex items-center justify-between p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 group/sub">
                                                            <div className="flex items-center gap-2 overflow-hidden">
                                                                <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-[10px] font-black shrink-0">
                                                                    {sub.firstName[0]}
                                                                </div>
                                                                <span className="text-xs font-bold text-slate-700 truncate">{sub.firstName} {sub.lastName}</span>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleSubordinateChange(sub.id, null)}
                                                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-white rounded-lg transition-all opacity-0 group-hover/sub:opacity-100"
                                                                title="Remove as subordinate"
                                                            >
                                                                <UserMinus size={14} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Add new subordinate */}
                                        <div className="mt-4">
                                            <label className="block text-[10px] font-bold text-slate-400 mb-2">Add New Subordinate</label>
                                            <select
                                                className="w-full px-5 py-3 bg-slate-100/50 border-none rounded-xl text-xs font-bold appearance-none"
                                                onChange={(e) => {
                                                    if (e.target.value) {
                                                        handleSubordinateChange(e.target.value, employee.id);
                                                        e.target.value = "";
                                                    }
                                                }}
                                                defaultValue=""
                                            >
                                                <option value="">Select faculty member...</option>
                                                {allEmployees
                                                    .filter(emp => emp.id !== employee.id && emp.managerId !== employee.id && !invalidManagerIds.has(emp.id)) // Simplified: just avoid current subs and avoid causing loops (though adding sub is usually safe from loops unless they were a parent)
                                                    .map(emp => (
                                                        <option key={emp.id} value={emp.id}>
                                                            {emp.firstName} {emp.lastName}
                                                        </option>
                                                    ))
                                                }
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-8 border-t border-slate-50 bg-slate-50/10 flex gap-4 shrink-0">
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="flex-1 py-4 border border-slate-200 text-slate-500 rounded-2xl font-bold hover:bg-slate-50 transition-all text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                form="edit-emp-form"
                                disabled={isLoading}
                                type="submit"
                                className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 disabled:opacity-50 group"
                            >
                                {isLoading ? (
                                    <Loader2 size={20} className="animate-spin" />
                                ) : (
                                    <>Save Changes <Save size={18} className="group-hover:scale-110 transition-transform" /></>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
