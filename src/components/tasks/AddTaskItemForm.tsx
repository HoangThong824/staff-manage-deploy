"use client";

import { useState } from "react";
import { useData } from "@/context/DataContext";
import { Plus } from "lucide-react";

interface AddTaskItemFormProps {
    taskId: string;
    participants: { id: string; name: string; email: string }[];
    allowedAssigneeIds: string[] | null;
    onSuccess: () => void;
}

export function AddTaskItemForm({
    taskId,
    participants,
    allowedAssigneeIds,
    onSuccess,
}: AddTaskItemFormProps) {
  const { createTaskItem } = useData();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    setError("");

    try {
      await createTaskItem(taskId, title.trim(), assigneeId || undefined);
      setTitle("");
      setAssigneeId("");
      setIsOpen(false);
      onSuccess?.();
      window.location.reload();
    } catch (err: any) {
      setError(err.message || "Failed to add item");
    }

    setLoading(false);
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all font-semibold text-sm"
      >
        <Plus size={18} />
        Add Content
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl w-full max-w-sm shadow-sm animate-in fade-in slide-in-from-top-2">
      <div className="space-y-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New subtask title..."
          className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium"
          autoFocus
          onKeyDown={(e) => e.key === "Escape" && (setIsOpen(false), setTitle(""), setAssigneeId(""))}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assign to Member (Optional)</label>
                            <select
                                value={assigneeId}
                                onChange={(e) => setAssigneeId(e.target.value)}
                                className="w-full h-11 px-4 rounded-xl border-slate-200 text-sm focus:ring-indigo-500 focus:border-indigo-500 transition-all cursor-pointer"
                            >
                                <option value="">Chưa giao việc (Unassigned)</option>
                                {participants
                                    .filter(p => !allowedAssigneeIds || allowedAssigneeIds.includes(p.id))
                                    .map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name}
                                        </option>
                                    ))}
                            </select>
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={loading || !title.trim()}
          className="flex-1 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add Subtask"}
        </button>
        <button
          type="button"
          onClick={() => (setIsOpen(false), setTitle(""), setAssigneeId(""), setError(""))}
          className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-500 font-bold text-xs hover:bg-slate-100 transition-colors"
        >
          Cancel
        </button>
      </div>

      {error && (
        <p className="text-[10px] text-red-600 font-bold bg-red-50 p-2 rounded-lg border border-red-100">{error}</p>
      )}
    </form>
  );
}