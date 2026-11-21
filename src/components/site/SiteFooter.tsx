import { Link } from "@tanstack/react-router";
import { useT } from "@/lib/i18n";
import { useDB } from "@/lib/store";
import { FounderLine } from "./FounderCredit";
import { Logo } from "./SiteHeader";
import { NAV } from "./nav";

export function SiteFooter() {
  const { t } = useT();
  const db = useDB();
  return (
    <footer className="mt-16 border-t-2 border-t-primary bg-secondary pb-28 md:pb-10">
      <div className="container-page grid gap-8 py-10 md:grid-cols-[1.2fr_2fr]">
        <div className="space-y-3">
          <Logo />
          <p className="text-sm text-muted-foreground">
            {t("A community health-support platform for Bidhannagar.")}
          </p>
          <p className="text-sm">
            {t("24x7 Helpline")}: <span className="font-bold">{db.settings.helpline}</span>
          </p>
          <FounderLine />
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} className="py-1 text-muted-foreground hover:text-foreground">
              {t(n.label)}
            </Link>
          ))}
          <Link to="/privacy" className="py-1 text-muted-foreground hover:text-foreground">
            {t("Privacy")}
          </Link>
          <Link to="/terms" className="py-1 text-muted-foreground hover:text-foreground">
            {t("Terms")}
          </Link>
          <Link to="/doctor-panel" className="py-1 text-muted-foreground hover:text-foreground">
            {t("Doctor Panel")}
          </Link>
          <Link to="/admin" className="py-1 text-muted-foreground hover:text-foreground">
            {t("Admin Dashboard")}
          </Link>
        </div>
      </div>
      <div className="border-t">
        <p className="container-page py-4 text-center text-sm font-semibold text-muted-foreground">
          {t("Demo version. All data shown is dummy data for demonstration only.")}
        </p>
      </div>
    </footer>
  );
}
