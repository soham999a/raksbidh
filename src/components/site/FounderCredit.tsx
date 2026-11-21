import { UserRound } from "lucide-react";

import { CO_FOUNDER, FOUNDER } from "@/lib/founder";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/** Full founding credit, shown on the home page and the Key Persons page. */
export function FounderCredit({ featured = false }: { featured?: boolean }) {
  const { lang, t } = useT();

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-primary/30 bg-primary-soft p-5 shadow-card",
        featured && "sm:p-6",
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
        <span
          className={cn(
            "flex shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground [&_svg]:size-6",
            featured ? "size-16 [&_svg]:size-8" : "size-12",
          )}
        >
          <UserRound />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-primary-strong">
            {featured ? t("Founder & Initiator") : t("An initiative started by")}
          </p>
          <p className={cn("mt-1 font-display font-bold", featured ? "text-2xl" : "text-xl")}>
            {lang === "bn" ? FOUNDER.name : FOUNDER.nameEn}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {lang === "bn" ? FOUNDER.designation : FOUNDER.designationEn}
          </p>
        </div>
      </div>
    </div>
  );
}

/** Co-founder credit, shown directly under the founder on Key Persons and home. */
export function CoFounderCredit({ role = CO_FOUNDER.role }: { role?: string }) {
  return (
    <div className="surface mt-3 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:gap-5">
      <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary-strong [&_svg]:size-6">
        <UserRound />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-wide text-primary-strong">{role}</p>
        <p className="mt-1 font-display text-xl font-bold">{CO_FOUNDER.name}</p>
        <p className="mt-1 text-sm text-muted-foreground">{CO_FOUNDER.designation}</p>
      </div>
    </div>
  );
}

/** Compact credit for the footer. */
export function FounderLine() {
  const { lang, t } = useT();

  return (
    <p className="text-xs text-muted-foreground">
      {t("An initiative started by")}{" "}
      <span className="font-semibold text-foreground">
        {lang === "bn" ? FOUNDER.name : FOUNDER.nameEn}
      </span>
    </p>
  );
}
