import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, Clock, Filter, Search, Download, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { motion } from "framer-motion";

// ---- Data (edit here to update) ----
const RAW_DATA = [
  {
    course: "PDS COMP5310",
    color: "rose",
    items: [
      { title: "Group Assignment 1", weight: 15, due: "2025-09-14" },
      { title: "Group Assignment 2", weight: 25, due: "2025-10-26" },
      { title: "Final Exam", weight: 60, note: "Minimum 40% to Pass" },
    ],
  },
  {
    course: "Statistics STATS5002",
    color: "indigo",
    items: [
      { title: "Quiz", weight: 20, due: "2025-09-22" },
      { title: "Individual Assignment", weight: 10, due: "2025-11-02" },
      { title: "Weekly Quiz", weight: 10, recurring: true, note: "Weekly" },
    ],
  },
  {
    course: "DSA COMP9123",
    color: "emerald",
    items: [
      { title: "Assignment 1", weight: 10, due: "2025-08-31" },
      { title: "Assignment 2", weight: 15, due: "2025-10-12" },
      { title: "Assignment 3", weight: 15, due: "2025-11-07" },
      { title: "Weekly Quiz", weight: 10, recurring: true, note: "Weekly" },
      { title: "Final Exam", weight: 50 },
    ],
  },
  {
    course: "Project Management in IT INFO6007",
    color: "amber",
    items: [
      { title: "Quiz", weight: 5, dueLabel: "Week 4" },
      { title: "Viva", weight: 20, dueLabel: "Week 8" },
      { title: "Group Project", weight: 30, dueLabel: "Week 12" },
    ],
  },
];

// ---- Helpers ----
const TZ = "Australia/Sydney"; // Display timezone

function fmtDate(due) {
  if (!due) return null;
  try {
    // Parse ISO date safely
    const d = new Date(`${due}T00:00:00+10:00`); // Sydney AEST/AEDT approximation for display
    return d.toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: TZ });
  } catch {
    return due;
  }
}

function daysUntil(due) {
  if (!due) return null;
  const now = new Date();
  const todayLocal = new Date(new Intl.DateTimeFormat("en-AU", { timeZone: TZ }).format(now));
  const target = new Date(`${due}T00:00:00+10:00`);
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.ceil((target - todayLocal) / msPerDay);
}

function statusFor(due) {
  if (!due) return { label: "No date", intent: "secondary", icon: Info };
  const d = daysUntil(due);
  if (d < 0) return { label: `Overdue ${Math.abs(d)}d`, intent: "destructive", icon: AlertTriangle };
  if (d === 0) return { label: "Due today", intent: "warning", icon: Clock };
  if (d <= 7) return { label: `Due in ${d}d`, intent: "warning", icon: Clock };
  if (d <= 21) return { label: `In ${d}d`, intent: "default", icon: CalendarDays };
  return { label: `In ${d}d", intent: "outline", icon: CalendarDays };
}

function classForColor(color, variant = "bg") {
  const palette = {
    rose: {
      bg: "bg-rose-50",
      ring: "ring-rose-200",
      text: "text-rose-900",
      accent: "bg-rose-600",
      badge: "bg-rose-100 text-rose-700",
      border: "border-rose-200",
    },
    indigo: {
      bg: "bg-indigo-50",
      ring: "ring-indigo-200",
      text: "text-indigo-900",
      accent: "bg-indigo-600",
      badge: "bg-indigo-100 text-indigo-700",
      border: "border-indigo-200",
    },
    emerald: {
      bg: "bg-emerald-50",
      ring: "ring-emerald-200",
      text: "text-emerald-900",
      accent: "bg-emerald-600",
      badge: "bg-emerald-100 text-emerald-700",
      border: "border-emerald-200",
    },
    amber: {
      bg: "bg-amber-50",
      ring: "ring-amber-200",
      text: "text-amber-900",
      accent: "bg-amber-600",
      badge: "bg-amber-100 text-amber-700",
      border: "border-amber-200",
    },
  };
  return palette[color]?.[variant] ?? "";
}

function toFlatList(data) {
  const out = [];
  for (const c of data) {
    for (const it of c.items) {
      out.push({ course: c.course, color: c.color, ...it });
    }
  }
  return out;
}

function saveCSV(rows) {
  const header = ["Course", "Title", "Weight%", "Due Date", "Due Label", "Notes"];
  const body = rows.map(r => [
    r.course,
    r.title,
    r.weight ?? "",
    r.due ? fmtDate(r.due) : "",
    r.dueLabel ?? (r.recurring ? "Weekly" : ""),
    r.note ?? "",
  ]);
  const csv = [header, ...body].map(r => r.map(x => `"${String(x).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "course-planner-2025.csv";
  a.click();
  URL.revokeObjectURL(url);
}

// ---- UI ----
export default function CoursePlanner() {
  const [query, setQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [showCompleted, setShowCompleted] = useState(true); // reserved for future use
  const all = useMemo(() => toFlatList(RAW_DATA), []);

  const filtered = useMemo(() => {
    return all
      .filter(r => (courseFilter === "all" ? true : r.course === courseFilter))
      .filter(r => (query ? `${r.course} ${r.title}`.toLowerCase().includes(query.toLowerCase()) : true))
      .sort((a, b) => {
        const ad = a.due ? new Date(a.due) : null;
        const bd = b.due ? new Date(b.due) : null;
        if (ad && bd) return ad - bd;
        if (ad) return -1;
        if (bd) return 1;
        return 0;
      });
  }, [all, query, courseFilter]);

  const upcoming = filtered.filter(r => !!r.due);

  const courseOptions = ["all", ...RAW_DATA.map(d => d.course)];

  return (
    <div className="min-h-screen w-full p-6 sm:p-8 lg:p-10 bg-slate-50">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mx-auto max-w-6xl">
        <header className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Uni Course Planner — 2025</h1>
          <p className="text-slate-600 mt-1">Interactive overview of assessments, due dates, and weights (Timezone: {TZ}). Use filters, search, and export to CSV.</p>
        </header>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center mb-6">
          <div className="flex-1 flex items-center gap-2">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by course or title..." className="pl-9" />
            </div>
            <Select value={courseFilter} onValueChange={setCourseFilter}>
              <SelectTrigger className="w-56"><SelectValue placeholder="Filter by course" /></SelectTrigger>
              <SelectContent>
                {courseOptions.map(opt => (
                  <SelectItem key={opt} value={opt}>{opt === "all" ? "All courses" : opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2" onClick={() => saveCSV(filtered)}>
              <Download className="h-4 w-4" /> Export CSV
            </Button>
          </div>
        </div>

        {/* Upcoming timeline */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <CalendarDays className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Upcoming & Due</h2>
          </div>
          {upcoming.length === 0 ? (
            <p className="text-slate-600">No dated items found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcoming.map((r, idx) => {
                const s = statusFor(r.due);
                const Icon = s.icon;
                return (
                  <motion.div key={`${r.course}-${r.title}-${idx}`} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.3, delay: idx * 0.03 }}>
                    <Card className={`border ${classForColor(r.color, "border")} hover:shadow-lg transition-shadow`}>
                      <CardHeader className={`${classForColor(r.color, "bg")} ${classForColor(r.color, "text")} ${classForColor(r.color, "ring")} ring-1 rounded-t-2xl`}>
                        <CardTitle className="flex items-center justify-between text-base">
                          <span className="font-semibold truncate pr-2">{r.title}</span>
                          <Badge className={`${classForColor(r.color, "badge")} font-medium`}>{r.weight ? `${r.weight}%` : "—"}</Badge>
                        </CardTitle>
                        <div className="text-sm opacity-90 flex items-center gap-2">
                          <span className="truncate">{r.course}</span>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-slate-700">
                            <CalendarDays className="h-4 w-4" />
                            <span className="text-sm">{r.due ? fmtDate(r.due) : (r.dueLabel ?? r.note ?? "No set date")}</span>
                          </div>
                          <Badge variant={s.intent} className="gap-1">
                            <Icon className="h-3.5 w-3.5" /> {s.label}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>

        {/* By course */}
        <section className="mb-14">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="h-5 w-5" />
            <h2 className="text-xl font-semibold">All Assessments by Course</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {RAW_DATA.filter(c => courseFilter === "all" || c.course === courseFilter).map((c, i) => (
              <motion.div key={c.course} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.3, delay: i * 0.05 }}>
                <Card className={`border ${classForColor(c.color, "border")} overflow-hidden`}>
                  <div className={`${classForColor(c.color, "bg")} ${classForColor(c.color, "text")} ${classForColor(c.color, "ring")} ring-1 px-5 py-4`}>
                    <h3 className="text-lg font-semibold">{c.course}</h3>
                  </div>
                  <CardContent className="divide-y">
                    {c.items.map((it, idx) => {
                      const s = statusFor(it.due);
                      const Icon = s.icon;
                      return (
                        <div key={`${c.course}-${it.title}-${idx}`} className="py-4 flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium">{it.title}</span>
                              {it.weight != null && (
                                <Badge className={`${classForColor(c.color, "badge")} font-medium`}>{it.weight}%</Badge>
                              )}
                              {it.note && <Badge variant="outline">{it.note}</Badge>}
                              {it.recurring && <Badge variant="secondary">Recurring</Badge>}
                            </div>
                            <div className="text-sm text-slate-600 mt-1 flex items-center gap-2">
                              <CalendarDays className="h-4 w-4" />
                              <span>{it.due ? fmtDate(it.due) : (it.dueLabel ?? it.note ?? "No set date")}</span>
                            </div>
                          </div>
                          <div className="shrink-0">
                            <Badge variant={s.intent} className="gap-1">
                              <Icon className="h-3.5 w-3.5" /> {s.label}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Legend */}
        <section className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Legend & Tips</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600 space-y-2">
              <div className="flex flex-wrap gap-3 items-center">
                <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3.5 w-3.5" /> Overdue</Badge>
                <Badge variant="warning" className="gap-1"><Clock className="h-3.5 w-3.5" /> Due today/soon</Badge>
                <Badge variant="default" className="gap-1"><CalendarDays className="h-3.5 w-3.5" /> Upcoming</Badge>
                <Badge variant="outline" className="gap-1"><CalendarDays className="h-3.5 w-3.5" /> Later</Badge>
                <Badge variant="secondary" className="gap-1"><Info className="h-3.5 w-3.5" /> No date set</Badge>
              </div>
              <p>For "Week X" items (INFO6007), dates aren’t pinned. You can add actual dates later—just edit the data block at the top.</p>
            </CardContent>
          </Card>
        </section>

        <footer className="mt-8 text-center text-xs text-slate-500">
          Built for fast scanning. Update weights/dates in the data block above as your course outlines change.
        </footer>
      </motion.div>
    </div>
  );
}
