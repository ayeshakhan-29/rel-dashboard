"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import PrivateRoute from "../components/auth/PrivateRoute";
import { FileText } from "lucide-react";

interface SOP {
  id: string;
  title: string;
  summary: string;
  content: string;
  createdAt: string;
  shift: "day" | "night";
}

export default function SopsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sops, setSops] = useState<SOP[]>([]);
  const [selected, setSelected] = useState<SOP | null>(null);
  const [filter, setFilter] = useState<"all" | "day" | "night">("all");

  const sopsFilter = () => {
    if (filter === "all") return sops;
    return sops.filter((s) => s.shift === filter);
  };

  useEffect(() => {
    // Placeholder data - replace with real API later
    const data: SOP[] = [
      {
        id: "1",
        title: "Onboarding Checklist",
        summary: "Steps to onboard a new employee",
        content: "Full onboarding SOP content goes here...",
        createdAt: "2024-01-12",
        shift: "day",
      },
      {
        id: "2",
        title: "Escalation Procedure",
        summary: "How to escalate issues to management",
        content: "Full escalation SOP content goes here...",
        createdAt: "2024-02-05",
        shift: "night",
      },
      {
        id: "3",
        title: "Backup & Restore",
        summary: "Database backup and restore steps",
        content: "Full backup & restore SOP content goes here...",
        createdAt: "2024-03-01",
        shift: "day",
      },
    ];

    setSops(data);
  }, []);

  return (
    <PrivateRoute>
      <div className="flex h-screen bg-slate-50">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title="SOPs" onMenuClick={() => setSidebarOpen(true)} />

          <main className="flex-1 overflow-hidden bg-slate-50 flex h-full">
            <div className="w-1/3 border-r border-slate-200 flex flex-col bg-white">
              <div className="p-4 border-b border-slate-200 flex flex-col bg-white">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-slate-700">SOPs</h2>
                  <div className="text-sm text-slate-500">
                    Total: {sops.length}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setFilter("all")}
                    className={`px-3 py-1 rounded-md text-sm ${filter === "all" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-700"}`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilter("day")}
                    className={`px-3 py-1 rounded-md text-sm ${filter === "day" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-700"}`}
                  >
                    Day
                  </button>
                  <button
                    onClick={() => setFilter("night")}
                    className={`px-3 py-1 rounded-md text-sm ${filter === "night" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-700"}`}
                  >
                    Night
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {sopsFilter().length === 0 ? (
                  <div className="p-6 text-slate-500">No SOPs available</div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {sopsFilter().map((sop) => (
                      <div
                        key={sop.id}
                        onClick={() => setSelected(sop)}
                        className={`p-4 cursor-pointer hover:bg-slate-50 transition-colors border-l-4 ${selected?.id === sop.id ? "bg-emerald-50 border-emerald-500" : "border-transparent"}`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex items-center space-x-3">
                            <h3 className="text-sm font-semibold text-slate-900 truncate">
                              {sop.title}
                            </h3>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                              {sop.shift}
                            </span>
                          </div>
                          <span className="text-xs text-slate-500 whitespace-nowrap ml-2">
                            {sop.createdAt}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 truncate">
                          {sop.summary}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-white">
              {selected ? (
                <div className="p-8 max-w-4xl mx-auto">
                  <div className="mb-6 pb-4 border-b border-slate-200">
                    <h1 className="text-2xl font-bold text-slate-900 mb-1">
                      {selected.title}
                    </h1>
                    <p className="text-sm text-slate-500">
                      Created: {selected.createdAt}
                    </p>
                  </div>

                  <div className="prose max-w-none text-slate-700">
                    <p>{selected.content}</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-500">
                  <FileText className="h-16 w-16 mb-4 text-slate-200" />
                  <h3 className="text-lg font-medium text-slate-900">
                    Select an SOP
                  </h3>
                  <p>Choose an SOP from the left to view details</p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </PrivateRoute>
  );
}
