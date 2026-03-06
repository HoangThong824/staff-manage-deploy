import { getEmployees } from "@/actions/employee";
import { getDepartments } from "@/actions/department";
import { getPositions } from "@/actions/position";
import { AddEmployeeForm } from "@/components/admin/AddEmployeeForm";
import { EmployeesView } from "@/components/admin/EmployeesView";

export default async function EmployeesPage() {
    const [employees, departments, positions] = await Promise.all([
        getEmployees(),
        getDepartments(),
        getPositions()
    ]);

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-50 relative overflow-hidden group">
                <div className="relative z-10">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Academic Faculty</h1>
                    <p className="text-slate-500 text-lg mt-2 font-medium">Coordinate and manage your educational team members.</p>
                </div>
                <div className="relative z-10 flex gap-4">
                    <AddEmployeeForm
                        employees={employees as any}
                        departments={departments}
                        positions={positions}
                    />
                </div>
                <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 group-hover:opacity-80 transition-opacity translate-x-1/2 -translate-y-1/2" />
            </div>

            <EmployeesView employees={employees as any} isAdmin={true} />
        </div>
    );
}
