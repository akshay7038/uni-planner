// Placeholder only to satisfy imports (we're using a native <select> in page.tsx)
import * as React from "react";
export function Select({ children }: React.PropsWithChildren) { return <div className="hidden">{children}</div>; }
export function SelectTrigger({ className = "", children }: React.PropsWithChildren<{ className?: string }>) { return <div className={`${className}`}>{children}</div>; }
export function SelectValue({ placeholder }: { placeholder?: string }) { return <span>{placeholder}</span>; }
export function SelectContent({ children }: React.PropsWithChildren) { return <div className="hidden">{children}</div>; }
export function SelectItem({ value, children }: React.PropsWithChildren<{ value: string }>) { return <div data-value={value} className="hidden">{children}</div>; }
