"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type AccordionType = "single" | "multiple";

type AccordionContextValue = {
  type: AccordionType;
  value: string[];
  setValue: (next: string[]) => void;
};

const AccordionContext = React.createContext<AccordionContextValue | null>(null);

export function Accordion({
  className,
  type = "single",
  defaultValue,
  children,
}: {
  className?: string;
  type?: AccordionType;
  defaultValue?: string | string[];
  children: React.ReactNode;
}) {
  const initial = React.useMemo(() => {
    if (!defaultValue) return [];
    return Array.isArray(defaultValue) ? defaultValue : [defaultValue];
  }, [defaultValue]);

  const [value, setValue] = React.useState<string[]>(initial);

  return (
    <AccordionContext.Provider value={{ type, value, setValue }}>
      <div className={cn("space-y-2", className)}>{children}</div>
    </AccordionContext.Provider>
  );
}

export function AccordionItem({
  value,
  className,
  children,
}: {
  value: string;
  className?: string;
  children: React.ReactNode;
}) {
  const ctx = React.useContext(AccordionContext);
  if (!ctx) throw new Error("AccordionItem must be used within Accordion");

  const open = ctx.value.includes(value);

  return (
    <div
      className={cn("rounded-md border", className)}
      data-state={open ? "open" : "closed"}
    >
      {children}
    </div>
  );
}

export function AccordionTrigger({
  value,
  className,
  children,
}: {
  value: string;
  className?: string;
  children: React.ReactNode;
}) {
  const ctx = React.useContext(AccordionContext);
  if (!ctx) throw new Error("AccordionTrigger must be used within Accordion");

  const open = ctx.value.includes(value);

  function toggle() {
    const safeCtx = ctx!;
    const next = (() => {
      if (safeCtx.type === "single") return open ? [] : [value];
      return open
        ? safeCtx.value.filter((v) => v !== value)
        : [...safeCtx.value, value];
    })();
    safeCtx.setValue(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        "flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium",
        className,
      )}
      aria-expanded={open}
    >
      <span>{children}</span>
      <span className="text-muted-foreground">{open ? "−" : "+"}</span>
    </button>
  );
}

export function AccordionContent({
  value,
  className,
  children,
}: {
  value: string;
  className?: string;
  children: React.ReactNode;
}) {
  const ctx = React.useContext(AccordionContext);
  if (!ctx) throw new Error("AccordionContent must be used within Accordion");

  const open = ctx.value.includes(value);
  if (!open) return null;

  return <div className={cn("px-4 pb-4", className)}>{children}</div>;
}
