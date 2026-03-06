"use client";

import { useState } from "react";
import { useData } from "@/context/DataContext";
import { Plus } from "lucide-react";

interface AddTaskItemFormProps {
  taskId: string;
  onSuccess?: () => void;
}

export function AddTaskItemForm({ taskId, onSuccess }: AddTaskItemFormProps) {
  const { createTaskItem } = useData();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    setError("");

    try {
      await createTaskItem(taskId, title.trim());
      setTitle("");
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
    <form onSubmit={handleSubmit} className="flex gap-2 relative">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter task..."
        className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
        autoFocus
        onKeyDown={(e) => e.key === "Escape" && (setIsOpen(false), setTitle(""))}
      />

      <button
        type="submit"
        disabled={loading || !title.trim()}
        className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Adding..." : "Add"}
      </button>

      <button
        type="button"
        onClick={() => (setIsOpen(false), setTitle(""), setError(""))}
        className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50"
      >
        Cancel
      </button>

      {error && (
        <p className="absolute mt-12 text-xs text-red-600">{error}</p>
      )}
    </form>
  );
}