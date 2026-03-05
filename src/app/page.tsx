import { Users, Building2, Briefcase, Calendar, TrendingUp, ArrowUpRight, Clock, ClipboardList } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { getTasks } from "@/actions/task";
import { redirect } from "next/navigation";
import { UpdateTaskStatusButton } from "@/components/employee/UpdateTaskStatusButton";
import { AssignTaskForm } from "@/components/admin/AssignTaskForm";

const stats = [
  { name: "Total Educators", value: "124", icon: Users, change: "+12%", color: "text-indigo-600", bg: "bg-indigo-50" },
  { name: "Academic Depts", value: "8", icon: Building2, change: "0%", color: "text-violet-600", bg: "bg-violet-50" },
  { name: "Faculty Openings", value: "4", icon: Briefcase, change: "-2", color: "text-emerald-600", bg: "bg-emerald-50" },
  { name: "Student Events", value: "12", icon: Calendar, change: "+3", color: "text-amber-600", bg: "bg-amber-50" },
];

const recentActivity = [
  { id: 1, action: "New faculty member onboarded", target: "Dr. Alicia Keyes", time: "2 hours ago", type: "hire" },
  { id: 2, action: "Seminar room reserved", target: "Hall A", time: "4 hours ago", type: "reserve" },
  { id: 3, action: "Curriculum updated", target: "Science Dept", time: "Yesterday", type: "update" },
  { id: 4, action: "Funding proposal submitted", target: "Research Grant", time: "2 days ago", type: "funding" },
];

export default async function Dashboard() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const role = session.user.role;

  if (role === "EMPLOYEE") {
    // Employee Dashboard
    const employeeId = session.user.employeeId!;
    const dbData = await import("@/lib/db").then(m => m.readDb());
    const tasks = await getTasks({ employeeId });
    const subordinates = await import("@/lib/db").then(m => m.db.employee.getSubordinates(employeeId));

    // Sort tasks: pending/in_progress first, then completed
    const activeTasks = tasks.filter(t => t.status !== "COMPLETED");
    const completedTasks = tasks.filter(t => t.status === "COMPLETED");

    const getStatusColor = (status: string) => {
      if (status === 'COMPLETED') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      if (status === 'IN_PROGRESS') return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      return 'bg-amber-50 text-amber-700 border-amber-200';
    };

    return (
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="relative overflow-hidden p-10 rounded-[2.5rem] bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 text-white shadow-2xl shadow-indigo-200/50">
          <div className="relative z-10 flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight mb-2">Welcome back, {session.user.name}</h1>
              <p className="text-indigo-100/80 text-lg max-w-lg font-medium">Ready to inspire today? You have {activeTasks.length} active tasks awaiting your attention.</p>
            </div>
            {subordinates.length > 0 && (
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 hidden lg:block">
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-1">Team Overview</p>
                <p className="text-2xl font-black">{subordinates.length} Direct Reports</p>
              </div>
            )}
          </div>
          <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-[-20%] left-[-5%] w-64 h-64 bg-indigo-400/20 rounded-full blur-2xl" />
        </div>

        {subordinates.length > 0 && (
          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-50 overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-indigo-50/30">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Academic Team Assignments</h2>
                <p className="text-sm text-slate-500 font-medium">Assign and track tasks for your faculty subordinates.</p>
              </div>
              <AssignTaskForm employees={subordinates as any} adminId={session.user.id} />
            </div>
          </div>
        )}


        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { label: "Active Tasks", count: activeTasks.length, icon: Clock, color: "indigo" },
            { label: "Finished", count: completedTasks.length, icon: Calendar, color: "emerald" },
            { label: "Overall Tasks", count: tasks.length, icon: ClipboardList, color: "violet" }
          ].map((item) => (
            <div key={item.label} className="group p-8 bg-white border border-slate-100 rounded-[2rem] shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3.5 rounded-2xl bg-${item.color}-50 text-${item.color}-600 group-hover:scale-110 transition-transform`}>
                  <item.icon size={26} />
                </div>
                <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Statistics</div>
              </div>
              <p className="text-4xl font-black text-slate-800 mb-1">{item.count}</p>
              <p className="text-sm font-semibold text-slate-500">{item.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-50 overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
            <h2 className="text-xl font-bold text-slate-800">Your Learning Path & Tasks</h2>
            <button className="text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors">View All</button>
          </div>
          {tasks.length === 0 ? (
            <div className="p-20 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                <ClipboardList size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">No active tasks</h3>
              <p className="text-slate-400 max-w-xs mx-auto">Great job! You've caught up on all your assigned work.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50 px-4">
              {[...activeTasks, ...completedTasks].map((task) => (
                <div key={task.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-slate-50/50 rounded-2xl transition-all gap-6 my-2 group">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`w-2 h-2 rounded-full ${task.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-indigo-500 animate-pulse'}`} />
                      <h3 className="font-bold text-slate-900 text-lg group-hover:text-indigo-600 transition-colors">{task.title}</h3>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${getStatusColor(task.status)}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-slate-500 text-sm leading-relaxed mb-4">{task.description}</p>
                    <div className="flex items-center gap-4 text-[11px] font-bold text-slate-400">
                      {task.dueDate && (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-full">
                          <Clock size={12} className="text-indigo-500" />
                          DUE: {new Date(task.dueDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0 bg-slate-50/80 p-5 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest text-center">Action required</p>
                    <UpdateTaskStatusButton id={task.id} currentStatus={task.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Admin Dashboard
  const dbData = await import("@/lib/db").then(m => m.readDb());
  const employees = dbData.employees;
  const departments = dbData.departments;
  const positions = dbData.positions;
  const users = dbData.users;
  const adminTasks = await getTasks({ assignedBy: session.user.id });

  const adminCount = users.filter(u => u.role === "ADMIN").length;
  const activeAdminTasks = adminTasks.filter(t => t.status !== "COMPLETED").length;

  const liveStats = [
    { name: "Academic Faculty", value: (employees.length + adminCount).toString(), icon: Users, change: "Active", color: "text-indigo-600", bg: "bg-indigo-50" },
    { name: "Academic Depts", value: departments.length.toString(), icon: Building2, change: "Live", color: "text-violet-600", bg: "bg-violet-50" },
    { name: "Faculty Openings", value: positions.length.toString(), icon: Briefcase, change: "Verified", color: "text-emerald-600", bg: "bg-emerald-50" },
    { name: "Ongoing Tasks", value: activeAdminTasks.toString(), icon: ClipboardList, change: "Priority", color: "text-amber-600", bg: "bg-amber-50" },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Header section */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Academic Overview</h1>
          <p className="text-slate-500 mt-1 font-medium">Welcome back, Principal. Here's a glimpse of your institution.</p>
        </div>
        <div className="hidden md:flex gap-3">
          <button className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">Export Report</button>
          <button className="px-5 py-2.5 bg-indigo-600 rounded-xl text-sm font-bold text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">Quick Assign</button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {liveStats.map((stat) => (
          <div key={stat.name} className="group p-8 bg-white border border-slate-100 rounded-[2rem] shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <div className={stat.bg + " p-4 rounded-2xl " + stat.color + " group-hover:scale-110 transition-transform shadow-sm"}>
                <stat.icon size={26} />
              </div>
              <div className="flex items-center text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100 uppercase tracking-widest">
                {stat.change}
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-400 mb-1">{stat.name}</p>
              <h3 className="text-4xl font-black text-slate-800">{stat.value}</h3>
            </div>
            <div className="mt-6 pt-6 border-t border-slate-50 flex items-center text-[11px] font-bold text-slate-400 group-hover:text-indigo-600 transition-colors uppercase tracking-widest cursor-pointer">
              Explore Metrics <ArrowUpRight size={14} className="ml-2 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Chart placeholder */}
        <div className="lg:col-span-2 p-8 bg-white border border-slate-50 rounded-[2.5rem] shadow-xl shadow-slate-200/30 flex flex-col min-h-[450px]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-slate-800">Faculty Enrollment Trends</h3>
            <div className="flex bg-slate-50 p-1 rounded-xl">
              <button className="px-4 py-1.5 bg-white rounded-lg text-xs font-bold text-slate-800 shadow-sm">Monthly</button>
              <button className="px-4 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors">Yearly</button>
            </div>
          </div>
          <div className="flex-1 bg-gradient-to-b from-slate-50/50 to-transparent rounded-[1.5rem] border border-dashed border-slate-200 flex items-center justify-center relative overflow-hidden">
            <div className="text-center relative z-10">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4">
                <TrendingUp size={32} className="text-indigo-400" />
              </div>
              <p className="text-slate-400 font-bold text-sm tracking-tight px-4">Dynamic trend analysis data will be initialized shortly.</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="p-8 bg-white border border-slate-50 rounded-[2.5rem] shadow-xl shadow-slate-200/30">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-slate-800">Campus Flow</h3>
            <span className="w-3 h-3 bg-emerald-500 rounded-full animate-ping" />
          </div>
          <div className="space-y-8">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex gap-5 group">
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                    <Clock size={20} className="transition-transform group-hover:rotate-12" />
                  </div>
                  {activity.id !== recentActivity.length && (
                    <div className="absolute top-14 left-1/2 -ml-[0.5px] w-px h-6 bg-slate-100" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-800 mb-0.5">{activity.action}</p>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{activity.target} • {activity.time}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-10 py-4 text-xs font-black text-slate-400 hover:text-indigo-600 hover:bg-indigo-50/50 rounded-2xl transition-all border border-dashed border-slate-200 hover:border-indigo-100 uppercase tracking-widest">
            Audit Complete History
          </button>
        </div>
      </div>
    </div>
  );
}
