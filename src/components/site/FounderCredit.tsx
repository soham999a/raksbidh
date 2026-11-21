import { UserRound } from "lucide-react";

import { CO_FOUNDER, FOUNDER } from "@/lib/founder";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/** Shared card so the founder and co-founder credits look and behave identically. */
function CreditCard({
  label,
  name,
  designation,
  featured = false,
}: {
  label: string;
  name: string;
  designation: string;
  featured?: boolean;
}) {
  return (
    <div
      className={cn(
        "group overflow-hidden rounded-2xl border border-primary/30 bg-primary-soft p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-lift",
        featured && "sm:p-6",
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
        <span
          className={cn(
            "flex shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground transition-colors group-hover:bg-primary-strong [&_svg]:size-6",
            featured ? "size-16 [&_svg]:size-8" : "size-12",
          )}
        >
          <UserRound />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-primary-strong">{label}</p>
          <p className={cn("mt-1 font-display font-bold", featured ? "text-2xl" : "text-xl")}>
            {name}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{designation}</p>
        </div>
      </div>
    </div>
  );
}

/** Full founding credit, shown on the home page and the Key Persons page. */
export function FounderCredit({ featured = false }: { featured?: boolean }) {
  const { lang, t } = useT();

  return (
    <CreditCard
      featured={featured}
      label={featured ? t("Founder & Initiator") : t("An initiative started by")}
      name={lang === "bn" ? FOUNDER.name : FOUNDER.nameEn}
      designation={lang === "bn" ? FOUNDER.designation : FOUNDER.designationEn}
    />
  );
}

/** Co-founder credit, shown directly under the founder on Key Persons and home. */
export function CoFounderCredit({
  role = CO_FOUNDER.role,
  featured = false,
}: {
  role?: string;
  featured?: boolean;
}) {
  return (
    <CreditCard
      featured={featured}
      label={role}
      name={CO_FOUNDER.name}
      designation={CO_FOUNDER.designation}
    />
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
