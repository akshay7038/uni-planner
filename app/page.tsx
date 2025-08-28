
"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarDays, Clock, Filter, Search, Download, AlertTriangle, Bug, Info } from "lucide-react";
// framer-motion is installed, but we can omit its usage here to avoid SSR hiccups
// import { motion } from "framer-motion";

const RAW_DATA = [
  { course: "PDS COMP5310", color: "rose", items: [
      { title: "Group Assignment 1", weight: 15, due: "2025-09-14" },
      { title: "Group Assignment 2", weight: 25, due: "2025-10-26" },
      { title: "Final Exam", weight: 60, note: "Minimum 40% to Pass" },
  ]},
  { course: "Statistics STATS5002", color: "indigo", items: [
      { title: "Quiz", weight: 20, due: "2025-09-22" },
      { title: "Individual Assignment", weight: 10, due: "2025-11-02" },
      { title: "Weekly Quiz", weight: 10, recurring: true, note: "Weekly" },
  ]},
  { course: "DSA COMP9123", color: "emerald", items: [
      { title: "Assignment 1", weight: 10, due: "2025-08-31" },
      { title: "Assignment 2", weight: 15, due: "2025-10-12" },
      { title: "Assignment 3", weight: 15, due: "2025-11-07" },
      { title: "Weekly Quiz", weight: 10, recurring: true, note: "Weekly" },
      { title: "Final Exam", weight: 50 },
  ]},
  { course: "Project Management in IT INFO6007", color: "amber", items: [
      { title: "Quiz", weight: 5, dueLabel: "Week 4" },
      { title: "Viva", weight: 20, dueLabel: "Week 8" },
      { title: "Group Project", weight: 30, dueLabel: "Week 12" },
  ]},
];

const TZ = "Australia/Sydney";
function fmtDate(due?: string | null) {
  if (!due) return null;
  try {
    const [y, m, d] = due.split("-").map(Number);
    const dt = new Date(Date.UTC(y, (m || 1) - 1, d || 1));
    return dt.toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: TZ });
  } catch { return due; }
}
function daysUntil(due?: string | null) {
  if (!due) return null;
  const nowInTz = new Date(new Date().toLocaleString("en-US", { timeZone: TZ }));
  const todayUTC = Date.UTC(nowInTz.getFullYear(), nowInTz.getMonth(), nowInTz.getDate());
  const [y, m, d] = due.split("-").map(Number);
  const targetUTC = Date.UTC(y, (m || 1) - 1, d || 1);
  return Math.ceil((targetUTC - todayUTC) / (1000 * 60 * 60 * 24));
}
function statusFor(due?: string | null) {
  if (!due) return { label: "No date", intent: "secondary", icon: Info };
  const d = daysUntil(due)!;
  if (d < 0) return { label: `Overdue ${Math.abs(d)}d`, intent: "destructive", icon: AlertTriangle };
  if (d === 0) return { label: "Due today", intent: "warning", icon: Clock };
  if (d <= 7) return { label: `Due in ${d}d`, intent: "warning", icon: Clock };
  if (d <= 21) return { label: `In ${d}d`, intent: "default", icon: CalendarDays };
  return { label: `In ${d}d`, intent: "outline", icon: CalendarDays };
}
function classForColor(color: string, variant: string = "bg") {
  const palette: Record<string, any> = {
    rose: { bg: "bg-rose-50", ring: "ring-rose-200", text: "text-rose-900", badge: "bg-rose-100 text-rose-700", border: "border-rose-200" },
    indigo:{ bg: "bg-indigo-50", ring: "ring-indigo-200", text: "text-indigo-900", badge: "bg-indigo-100 text-indigo-700", border: "border-indigo-200" },
    emerald:{ bg: "bg-emerald-50", ring: "ring-emerald-200", text: "text-emerald-900", badge: "bg-emerald-100 text-emerald-700", border: "border-emerald-200" },
    amber: { bg: "bg-amber-50", ring: "ring-amber-200", text: "text-amber-900", badge: "bg-amber-100 text-amber-700", border: "border-amber-200" },
  };
  return (palette[color] && palette[color][variant]) || "";
}
function toFlatList(data: any[]) { const out: any[] = []; for (const c of data) for (const it of c.items) out.push({ course: c.course, color: c.color, ...it }); return out; }
function saveCSV(rows: any[]) {
  const header = ["Course", "Title", "Weight%", "Due Date", "Due Label", "Notes"];
  const body = rows.map(r => [r.course, r.title, r.weight ?? "", r.due ? fmtDate(r.due) : "", r.dueLabel ?? (r.recurring ? "Weekly" : ""), r.note ?? ""]);
  const csv = [header, ...body].map(r => r.map((x: any) => `"${String(x).replace(/"/g, '""')}"`).join(",")).join("\\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "course-planner-2025.csv"; a.click(); URL.revokeObjectURL(url);
}
function isoOffsetFromToday(days: number) {
  const nowInTz = new Date(new Date().toLocaleString("en-US", { timeZone: TZ }));
  const test = new Date(Date.UTC(nowInTz.getFullYear(), nowInTz.getMonth(), nowInTz.getDate()));
  test.setUTCDate(test.getUTCDate() + days);
  const yyyy = test.getUTCFullYear();
  const mm = String(test.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(test.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
function runSelfTests() {
  const cases = [
    { name: "No date -> secondary", input: null, expect: { intent: "secondary", label: "No date" } },
    { name: "Overdue -> destructive", input: isoOffsetFromToday(-1), prefix: "Overdue ", expect: { intent: "destructive" } },
    { name: "Due today -> warning", input: isoOffsetFromToday(0), expect: { intent: "warning", label: "Due today" } },
    { name: "<=7 days -> warning", input: isoOffsetFromToday(5), expect: { intent: "warning", label: "Due in 5d" } },
    { name: "<=21 days -> default", input: isoOffsetFromToday(14), expect: { intent: "default", label: "In 14d" } },
    { name: ">21 days -> outline", input: isoOffsetFromToday(30), expect: { intent: "outline", label: "In 30d" } },
    { name: "Boundary 21 -> default", input: isoOffsetFromToday(21), expect: { intent: "default", label: "In 21d" } },
    { name: "Boundary 22 -> outline", input: isoOffsetFromToday(22), expect: { intent: "outline", label: "In 22d" } },
  ];
  return cases.map((tc) => {
    const res = statusFor(tc.input as any);
    const labelOK = tc.prefix ? String(res.label).startsWith(tc.prefix) : res.label === (tc.expect as any).label || (tc.expect as any).label === undefined;
    const intentOK = res.intent === (tc.expect as any).intent;
    return { name: tc.name, pass: labelOK && intentOK, got: res, expect: tc.expect };
  });
}
export default function Page() {
  const [query, setQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [showTests, setShowTests] = useState(false);
  const all = useMemo(() => toFlatList(RAW_DATA), []);
  const filtered = useMemo(() => {
    return all
      .filter((r:any) => (courseFilter === "all" ? true : r.course === courseFilter))
      .filter((r:any) => (query ? `${r.course} ${r.title}`.toLowerCase().includes(query.toLowerCase()) : true))
      .sort((a:any, b:any) => {
        const ad = a.due ? new Date(a.due) : null;
        const bd = b.due ? new Date(b.due) : null;
        if (ad && bd) return (ad as any) - (bd as any);
        if (ad) return -1;
        if (bd) return 1;
        return 0;
      });
  }, [all, query, courseFilter]);
  const upcoming = filtered.filter((r:any) => !!r.due);
  const courseOptions = ["all", ...new Set(RAW_DATA.map(d => d.course))];
  const [testResults, setTestResults] = useState<any[]>([]);
  useEffect(() => { if (showTests) setTestResults(runSelfTests()); }, [showTests]);
  return (
    <div className="min-h-screen w-full p-6 sm:p-8 lg:p-10 bg-slate-50">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Uni Course Planner — 2025</h1>
          <p className="text-slate-600 mt-1">Interactive overview of assessments, due dates, and weights (Timezone: Australia/Sydney). Use filters, search, and export to CSV.</p>
        </header>
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center mb-6">
          <div className="flex-1 flex items-center gap-2">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by course or title..." className="pl-9" />
            </div>
            <div>
              <select value={courseFilter} onChange={(e)=>setCourseFilter(e.target.value)} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm">
                {courseOptions.map((opt) => (<option key={opt} value={opt}>{opt === "all" ? "All courses" : opt}</option>))}
              </select>
            </div>
            <Button variant="outline" className="gap-2" onClick={() => saveCSV(filtered)}>
              <Download className="h-4 w-4" /> Export CSV
            </Button>
            <Button variant="ghost" className="gap-2" onClick={() => setShowTests(s => !s)} title="Toggle developer tests">
              <Bug className="h-4 w-4" /> {showTests ? "Hide" : "Run"} self-tests
            </Button>
          </div>
        </div>
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <CalendarDays className="h-5 w-5" /><h2 className="text-xl font-semibold">Upcoming & Due</h2>
          </div>
          {upcoming.length === 0 ? (<p className="text-slate-600">No dated items found.</p>) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcoming.map((r:any, idx:number) => {
                const s = statusFor(r.due); const Icon:any = s.icon;
                return (
                  <div key={`${r.course}-${r.title}-${idx}`} className="transition-shadow hover:shadow-lg">
                    <Card className={`border ${classForColor(r.color, "border")}`}>
                      <CardHeader className={`${classForColor(r.color, "bg")} ${classForColor(r.color, "text")} ring-1 ${classForColor(r.color, "ring")} rounded-t-2xl`}>
                        <CardTitle className="flex items-center justify-between text-base">
                          <span className="font-semibold truncate pr-2">{r.title}</span>
                          <Badge className={`${classForColor(r.color, "badge")} font-medium`}>{r.weight ? `${r.weight}%` : "—"}</Badge>
                        </CardTitle>
                        <div className="text-sm opacity-90 flex items-center gap-2"><span className="truncate">{r.course}</span></div>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-slate-700">
                            <CalendarDays className="h-4 w-4" />
                            <span className="text-sm">{r.due ? fmtDate(r.due) : (r.dueLabel ?? r.note ?? "No set date")}</span>
                          </div>
                          <Badge variant={s.intent as any} className="gap-1"><Icon className="h-3.5 w-3.5" /> {s.label}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          )}
        </section>
        <section className="mb-14">
          <div className="flex items-center gap-2 mb-3"><Filter className="h-5 w-5" /><h2 className="text-xl font-semibold">All Assessments by Course</h2></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {RAW_DATA.filter((c:any) => courseFilter === "all" || c.course === courseFilter).map((c:any, i:number) => (
              <div key={c.course} className="transition-all">
                <Card className={`border ${classForColor(c.color, "border")} overflow-hidden`}>
                  <div className={`${classForColor(c.color, "bg")} ${classForColor(c.color, "text")} ring-1 ${classForColor(c.color, "ring")} px-5 py-4`}>
                    <h3 className="text-lg font-semibold">{c.course}</h3>
                  </div>
                  <CardContent className="divide-y">
                    {c.items.map((it:any, idx:number) => {
                      const s = statusFor(it.due); const Icon:any = s.icon;
                      return (
                        <div key={`${c.course}-${it.title}-${idx}`} className="py-4 flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium">{it.title}</span>
                              {it.weight != null && (<Badge className={`${classForColor(c.color, "badge")} font-medium`}>{it.weight}%</Badge>)}
                              {it.note && <Badge variant="outline">{it.note}</Badge>}
                              {it.recurring && <Badge variant="secondary">Recurring</Badge>}
                            </div>
                            <div className="text-sm text-slate-600 mt-1 flex items-center gap-2">
                              <CalendarDays className="h-4 w-4" /><span>{it.due ? fmtDate(it.due) : (it.dueLabel ?? it.note ?? "No set date")}</span>
                            </div>
                          </div>
                          <div className="shrink-0"><Badge variant={s.intent as any} className="gap-1"><Icon className="h-3.5 w-3.5" /> {s.label}</Badge></div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </section>
        <section className="mb-6">
          <Card><CardHeader><CardTitle className="text-base">Legend & Tips</CardTitle></CardHeader>
            <CardContent className="text-sm text-slate-600 space-y-2">
              <div className="flex flex-wrap gap-3 items-center">
                <Badge variant="destructive" className="gap-1">Overdue</Badge>
                <Badge variant="warning" className="gap-1">Due today/soon</Badge>
                <Badge variant="default" className="gap-1">Upcoming</Badge>
                <Badge variant="outline" className="gap-1">Later</Badge>
                <Badge variant="secondary" className="gap-1">No date set</Badge>
              </div>
              <p>For "Week X" items (INFO6007), dates aren’t pinned. You can add actual dates later—just edit the data block at the top.</p>
            </CardContent></Card>
        </section>
        {showTests && (
          <section className="mb-10">
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2">Self‑Tests</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {/* Would render test results here if needed */}
                </div>
              </CardContent>
            </Card>
          </section>
        )}
        <footer className="mt-8 text-center text-xs text-slate-500">Built for fast scanning. Update weights/dates in the data block above as your course outlines change.</footer>
      </div>
    </div>
  );
}
