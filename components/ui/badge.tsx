import * as React from "react";

type Variant = "default" | "secondary" | "destructive" | "outline" | "warning";

export function Badge({ children, className = "", variant = "default" as Variant }: React.PropsWithChildren<{ className?: string, variant?: Variant }>) {
  const map: Record<Variant, string> = {
    default: "bg-slate-900 text-white",
    secondary: "bg-slate-200 text-slate-800",
    destructive: "bg-rose-600 text-white",
    outline: "border border-slate-300 text-slate-700",
    warning: "bg-amber-500 text-white",
  };
  const base = "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium";
  return <span className={`${base} ${map[variant]} ${className}`}>{children}</span>;
}
