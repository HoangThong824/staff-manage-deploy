import { getDepartments } from "@/actions/department";
import { AddDepartmentForm } from "@/components/admin/AddDepartmentForm";
import { DepartmentsView } from "@/components/admin/DepartmentsView";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function DepartmentsPage() {
    const session = await getSession();
    if (!session || session.user.role !== "ADMIN") {
        redirect("/");
    }

    const departments = await getDepartments();

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-50 relative overflow-hidden group">
                <div className="relative z-10">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Academic Departments</h1>
                    <p className="text-slate-500 text-lg mt-2 font-medium">Manage and organize the institutional structure of your faculties.</p>
                </div>
                <div className="relative z-10">
                    <AddDepartmentForm />
                </div>
                <div className="absolute right-0 top-0 w-64 h-64 bg-violet-50 rounded-full blur-3xl opacity-50 group-hover:opacity-80 transition-opacity translate-x-1/2 -translate-y-1/2" />
            </div>

            <DepartmentsView departments={departments} />
        </div>
    );
}
