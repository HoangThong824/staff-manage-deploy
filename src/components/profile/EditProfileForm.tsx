"use client";

import { useState } from "react";
import { User, Phone, MapPin, Calendar, Save, X, Loader2, CheckCircle2 } from "lucide-react";
import { useData } from "@/context/DataContext";

interface EditProfileFormProps {
    user: any;
    employee: any;
    onCancel: () => void;
    onSuccess: () => void;
}

export function EditProfileForm({ user, employee, onCancel, onSuccess }: EditProfileFormProps) {
    const { updateUser, updateEmployee } = useData();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const name = formData.get("name") as string;
        const phone = formData.get("phone") as string;
        const address = formData.get("address") as string;
        const birthDate = formData.get("birthDate") as string;

        try {
            // 1. Update User Name
            await updateUser(user.id, { name });

            // 2. Update Employee Details if they exist
            if (employee) {
                await updateEmployee(employee.id, {
                    phone,
                    address,
                    birthDate
                });
            }

            setIsSuccess(true);
            setTimeout(() => {
                onSuccess();
            }, 1500);
        } catch (err: any) {
            setError(err.message || "Failed to update profile");
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="bg-emerald-50 border border-emerald-100 p-12 rounded-[2.5rem] flex flex-col items-center justify-center text-center space-y-4 animate-in zoom-in-95 duration-500">
                <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-200 animate-bounce">
                    <CheckCircle2 size={40} />
                </div>
                <h3 className="text-2xl font-black text-emerald-900">Profile Updated!</h3>
                <p className="text-emerald-700 font-medium">Your information has been successfully synced.</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 space-y-8">
                <div className="flex items-center gap-4 mb-2">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                        <User size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Edit Profile</h2>
                        <p className="text-slate-500 font-medium">Update your professional and personal information.</p>
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-sm font-bold">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Full Name */}
                    <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <input
                                required
                                name="name"
                                defaultValue={user.name || ""}
                                type="text"
                                className="w-full pl-14 pr-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 transition-all text-slate-700"
                                placeholder="Display Name"
                            />
                        </div>
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Phone Number</label>
                        <div className="relative">
                            <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <input
                                name="phone"
                                defaultValue={employee?.phone || ""}
                                type="tel"
                                className="w-full pl-14 pr-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 transition-all text-slate-700"
                                placeholder="+1 (555) 000-0000"
                            />
                        </div>
                    </div>

                    {/* Birth Date */}
                    <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Birth Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <input
                                name="birthDate"
                                defaultValue={employee?.birthDate || ""}
                                type="date"
                                className="w-full pl-14 pr-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 transition-all text-slate-700"
                            />
                        </div>
                    </div>

                    {/* Address */}
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Address</label>
                        <div className="relative">
                            <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <input
                                name="address"
                                defaultValue={employee?.address || ""}
                                type="text"
                                className="w-full pl-14 pr-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 transition-all text-slate-700"
                                placeholder="123 Faculty Lane, Academic City"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 py-4 px-6 border border-slate-200 text-slate-500 rounded-2xl font-bold hover:bg-slate-50 transition-all text-sm flex items-center justify-center gap-2"
                    >
                        <X size={18} />
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-[2] py-4 px-6 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 disabled:opacity-50 group"
                    >
                        {isLoading ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            <>
                                <Save size={18} className="group-hover:scale-110 transition-transform" />
                                Save Profile Changes
                            </>
                        )}
                    </button>
                </div>
            </div>
        </form>
    );
}
