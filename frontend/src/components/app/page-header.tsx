import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  backLink?: {
    href: string;
    label: string;
  };
}

export function PageHeader({ title, description, actions, backLink }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-2">
        {backLink && (
          <a
            href={backLink.href}
            className="text-sm text-muted-foreground hover:underline inline-block"
          >
            ← {backLink.label}
          </a>
        )}
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}
