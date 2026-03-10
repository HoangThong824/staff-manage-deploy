"use client";

import { useData } from "@/context/DataContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
    User as UserIcon,
    Mail,
    Shield,
    Briefcase,
    Building2,
    Calendar,
    Phone,
    MapPin,
    BadgeCheck,
    Clock,
    UserCircle,
    Edit3
} from "lucide-react";
import Link from "next/link";
import { EditProfileForm } from "@/components/profile/EditProfileForm";

export default function ProfilePage() {
    const { session, data, loading } = useData();
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (!loading && !session) {
            router.push("/login");
        }
    }, [session, loading, router]);

    if (loading || !session) return <div className="p-10 text-center font-bold">Loading Profile...</div>;

    const user = data.users.find(u => u.email === session.user.email);
    if (!user) {
        return <div className="p-10 text-center font-bold text-red-500">User not found</div>;
    }

    const employee = user.employeeId ? data.employees.find(e => e.id === user.employeeId) : null;
    const department = employee ? data.departments.find(d => d.id === employee.departmentId) : null;
    const position = employee ? data.positions.find(p => p.id === employee.positionId) : null;

    const formatDate = (dateString?: string | null) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header / Hero Section */}
            <div className="relative group overflow-hidden bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-50 flex flex-col md:flex-row items-center gap-8">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 group-hover:opacity-80 transition-opacity" />

                <div className="relative">
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2rem] bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white text-5xl font-bold shadow-2xl shadow-indigo-200 border-4 border-white overflow-hidden">
                        {user.avatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={user.avatarUrl}
                                alt="Avatar"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            (user.name?.[0] || user.email[0].toUpperCase())
                        )}
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-white p-2 rounded-2xl shadow-lg border border-slate-50">
                        <div className="bg-green-500 w-6 h-6 rounded-full border-4 border-white" />
                    </div>
                </div>

                <div className="text-center md:text-left space-y-2 relative">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">{user.name || "User"}</h1>
                        <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full uppercase tracking-wider border border-indigo-100 flex items-center gap-2">
                            <Shield size={14} />
                            {user.role}
                        </span>
                    </div>
                    <p className="text-slate-500 text-lg font-medium flex items-center justify-center md:justify-start gap-2">
                        <Mail size={18} className="text-slate-400" />
                        {user.email}
                    </p>
                    {employee && (
                        <p className="text-slate-400 font-bold text-sm tracking-widest uppercase pb-2">
                            Employee ID: {employee.employeeId}
                        </p>
                    )}
                </div>
            </div>

            {isEditing ? (
                <EditProfileForm
                    user={user}
                    employee={employee}
                    onCancel={() => setIsEditing(false)}
                    onSuccess={() => setIsEditing(false)}
                />
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Employment Information */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white rounded-[2rem] p-8 shadow-lg shadow-slate-200/40 border border-slate-50">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                                    <Briefcase size={24} />
                                </div>
                                <h2 className="text-xl font-bold text-slate-900">Employment Details</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <InfoCard
                                    icon={<Building2 size={20} />}
                                    label="Department"
                                    value={department?.name || "Global Operations"}
                                    color="bg-orange-50 text-orange-600"
                                />
                                <InfoCard
                                    icon={<UserCircle size={20} />}
                                    label="Position"
                                    value={user.role === 'ADMIN' ? 'System Administrator' : (position?.title) || "Staff"}
                                    color="bg-indigo-50 text-indigo-600"
                                />
                                <InfoCard
                                    icon={<Calendar size={20} />}
                                    label="Join Date"
                                    value={formatDate(employee?.joinDate || user.createdAt)}
                                    color="bg-emerald-50 text-emerald-600"
                                />
                                <InfoCard
                                    icon={<BadgeCheck size={20} />}
                                    label="Status"
                                    value={employee?.status || "ACTIVE"}
                                    color="bg-blue-50 text-blue-600"
                                />
                            </div>
                        </div>

                        {/* Personal Information */}
                        <div className="bg-white rounded-[2rem] p-8 shadow-lg shadow-slate-200/40 border border-slate-50">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2.5 bg-violet-50 text-violet-600 rounded-xl">
                                    <UserIcon size={24} />
                                </div>
                                <h2 className="text-xl font-bold text-slate-900">Personal Information</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <InfoCard
                                    icon={<Phone size={20} />}
                                    label="Phone Number"
                                    value={employee?.phone || "Not provided"}
                                    color="bg-rose-50 text-rose-600"
                                />
                                <InfoCard
                                    icon={<Calendar size={20} />}
                                    label="Birth Date"
                                    value={formatDate(employee?.birthDate)}
                                    color="bg-amber-50 text-amber-600"
                                />
                                <div className="md:col-span-2">
                                    <InfoCard
                                        icon={<MapPin size={20} />}
                                        label="Address"
                                        value={employee?.address || "Not provided"}
                                        color="bg-slate-50 text-slate-600"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Account Activity / Stats Sidebar */}
                    <div className="space-y-8">
                        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2rem] p-8 text-white shadow-xl shadow-indigo-200">
                            <h3 className="text-lg font-bold mb-6 opacity-90">Account Summary</h3>
                            <div className="space-y-6">
                                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                                    <span className="text-indigo-100 text-sm">Role</span>
                                    <span className="font-bold">{user.role}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                                    <span className="text-indigo-100 text-sm">Member Since</span>
                                    <span className="font-bold">{new Date(user.createdAt).getFullYear()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-indigo-100 text-sm">Email Verified</span>
                                    <span className="bg-white/20 px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest">Yes</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-[2rem] p-8 shadow-lg shadow-slate-200/40 border border-slate-50">
                            <h3 className="font-bold text-slate-900 mb-6">Quick Actions</h3>
                            <div className="space-y-3">
                                <Link
                                    href="/settings"
                                    className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 transition-all group"
                                >
                                    <span className="text-sm font-semibold">Change Password</span>
                                    <Clock size={18} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
                                </Link>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 transition-all group"
                                >
                                    <span className="text-sm font-semibold">Edit Profile</span>
                                    <Edit3 size={18} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function InfoCard({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string, color: string }) {
    return (
        <div className="space-y-2.5">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</span>
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/50 border border-slate-100 group hover:border-indigo-100 hover:bg-white transition-all">
                <div className={`p-2 rounded-xl transition-transform group-hover:scale-110 ${color}`}>
                    {icon}
                </div>
                <p className="font-bold text-slate-700 truncate">{value}</p>
            </div>
        </div>
    );
}

