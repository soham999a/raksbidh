import type { ReactNode, SelectHTMLAttributes } from "react";
import { format, parseISO } from "date-fns";
import { MessageCircle, Phone, SearchX, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";
import { telHref, waHref } from "@/lib/logic";
import { useDB } from "@/lib/store";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="hero-glow border-b">
      <div className="container-page py-8 md:py-12">
        <div className="flex items-start gap-4">
          {icon && (
            <div className="hidden size-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lift sm:flex [&_svg]:size-7">
              {icon}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-bold md:text-4xl">{title}</h1>
            {subtitle && <p className="mt-2 max-w-2xl text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
        {children && <div className="mt-6">{children}</div>}
      </div>
    </section>
  );
}

export function EmptyState({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  const { t } = useT();
  return (
    <div className="surface flex flex-col items-center gap-3 px-6 py-12 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <SearchX className="size-7" />
      </div>
      <p className="text-lg font-semibold">{t(title)}</p>
      {hint && <p className="max-w-sm text-sm text-muted-foreground">{t(hint)}</p>}
      {action}
    </div>
  );
}

export function BloodChip({
  group,
  active,
  onClick,
}: {
  group: string;
  active?: boolean;
  onClick?: () => void;
}) {
  const cls = cn(
    "inline-flex min-w-12 items-center justify-center rounded-full border px-2.5 py-1 text-sm font-bold",
    active
      ? "border-emergency bg-emergency text-emergency-foreground"
      : "border-emergency/30 bg-emergency-soft text-emergency",
  );
  if (onClick)
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(cls, "min-h-10 cursor-pointer")}
        aria-pressed={active}
      >
        {group}
      </button>
    );
  return <span className={cls}>{group}</span>;
}

export function CallButton({
  phone,
  label = "Call",
  size = "default",
  className,
}: {
  phone: string;
  label?: string;
  size?: "default" | "lg" | "xl" | "sm";
  className?: string;
}) {
  const { t } = useT();
  return (
    <Button asChild variant="success" size={size} className={className}>
      <a href={telHref(phone)}>
        <Phone /> {t(label)}
      </a>
    </Button>
  );
}

export function WhatsAppButton({
  phone,
  text,
  size = "default",
  className,
}: {
  phone: string;
  text?: string;
  size?: "default" | "lg" | "xl" | "sm";
  className?: string;
}) {
  const { t } = useT();
  return (
    <Button asChild variant="outline" size={size} className={className}>
      <a href={waHref(phone, text)} target="_blank" rel="noreferrer">
        <MessageCircle /> {t("WhatsApp")}
      </a>
    </Button>
  );
}

export function Field({
  label,
  error,
  children,
  hint,
}: {
  label: string;
  error?: string | undefined;
  children: ReactNode;
  hint?: string | undefined;
}) {
  const { t } = useT();
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-semibold">{t(label)}</span>
      {children}
      {hint && !error && <span className="block text-xs text-muted-foreground">{t(hint)}</span>}
      {error && <span className="block text-sm font-medium text-destructive">{t(error)}</span>}
    </label>
  );
}

export function NativeSelect({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn("field-control cursor-pointer", className)} {...props}>
      {children}
    </select>
  );
}

export function WardSelect({
  value,
  onChange,
  allLabel = "All wards",
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  allLabel?: string | null;
  className?: string;
}) {
  const db = useDB();
  const { t } = useT();
  return (
    <NativeSelect
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={className}
      aria-label={t("Ward")}
    >
      {allLabel !== null && <option value="">{t(allLabel)}</option>}
      {db.wards.map((w) => (
        <option key={w.id} value={String(w.number)}>
          {t("Ward")} {w.number}
        </option>
      ))}
    </NativeSelect>
  );
}

export function fmtDate(d: string) {
  try {
    return format(parseISO(d), "d MMM yyyy");
  } catch {
    return d;
  }
}

export function Verified({ date, label = "Last verified" }: { date: string; label?: string }) {
  const { t } = useT();
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      <ShieldCheck className="size-3.5 text-success" /> {t(label)}: {fmtDate(date)}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const { t } = useT();
  const v =
    status === "Confirmed" ||
    status === "Resolved" ||
    status === "Completed" ||
    status === "Published"
      ? "success"
      : status === "Cancelled"
        ? "danger"
        : status === "In-progress"
          ? "info"
          : status === "Draft"
            ? "muted"
            : "warning";
  return <Badge variant={v}>{t(status)}</Badge>;
}

export function Chip({
  children,
  active,
  onClick,
}: {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-full border px-4 text-sm font-semibold transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card hover:bg-primary-soft",
      )}
    >
      {children}
    </button>
  );
}

export function Avatar({ name, className }: { name: string; className?: string }) {
  const initials = name
    .replace(/^(Dr\.|Mr\.|Ms\.|Mrs\.|Sr\.)\s*/, "")
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("");
  return (
    <div
      className={cn(
        "flex size-16 shrink-0 items-center justify-center rounded-2xl bg-primary-soft font-display text-xl font-bold text-primary-strong",
        className,
      )}
      aria-hidden
    >
      {initials}
    </div>
  );
}
