import * as React from "react";
type Variant = "default" | "outline" | "ghost";
export function Button({ children, className = "", onClick, variant = "default" as Variant }: React.PropsWithChildren<{ className?: string, onClick?: () => void, variant?: Variant }>) {
  const map: Record<Variant, string> = {
    default: "bg-slate-900 text-white hover:opacity-90",
    outline: "border border-slate-300 text-slate-800 bg-white hover:bg-slate-50",
    ghost: "text-slate-700 hover:bg-slate-100",
  };
  const base = "inline-flex items-center gap-2 rounded-2xl px-3.5 py-2 text-sm";
  return <button onClick={onClick} className={`${base} ${map[variant]} ${className}`}>{children}</button>;
}
