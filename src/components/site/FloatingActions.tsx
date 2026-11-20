import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Ambulance, Building2, Droplets, Headset, Phone, Siren } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useT } from "@/lib/i18n";
import { telHref } from "@/lib/logic";
import { useDB } from "@/lib/store";

export function FloatingActions() {
  const { t } = useT();
  const db = useDB();
  const [open, setOpen] = useState(false);
  return (
    <>
      {/* Sticky emergency bar on mobile */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 p-3 backdrop-blur md:hidden">
        <Button
          variant="emergency"
          size="xl"
          className="pulse-ring w-full"
          onClick={() => setOpen(true)}
        >
          <Siren className="!size-6" /> {t("Emergency")}
        </Button>
      </div>
      {/* Desktop emergency button */}
      <Button
        variant="emergency"
        size="lg"
        className="pulse-ring fixed bottom-6 left-6 z-40 hidden rounded-full md:inline-flex"
        onClick={() => setOpen(true)}
      >
        <Siren /> {t("Emergency")}
      </Button>
      {/* Floating helpline button on every page */}
      <Link
        to="/helpline"
        aria-label={t("24x7 Helpline")}
        className="fixed right-4 bottom-24 z-40 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lift transition-transform hover:scale-105 md:right-6 md:bottom-6"
      >
        <Headset className="size-7" />
      </Link>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader>
            <SheetTitle className="text-2xl">{t("What help do you need?")}</SheetTitle>
          </SheetHeader>
          <div className="grid gap-3 px-4 pb-6 sm:grid-cols-2">
            <Button asChild variant="emergency" size="xl">
              <a href={telHref(db.settings.helpline)}>
                <Phone /> {t("Call helpline")} {db.settings.helpline}
              </a>
            </Button>
            <Button asChild variant="outline" size="xl">
              <Link to="/blood-banks" onClick={() => setOpen(false)}>
                <Droplets className="text-emergency" /> {t("Need Blood")}
              </Link>
            </Button>
            <Button asChild variant="outline" size="xl">
              <Link to="/ambulances" onClick={() => setOpen(false)}>
                <Ambulance className="text-emergency" /> {t("Need Ambulance")}
              </Link>
            </Button>
            <Button asChild variant="outline" size="xl">
              <Link to="/hospitals" search={{ emergency: "1" }} onClick={() => setOpen(false)}>
                <Building2 className="text-emergency" /> {t("Need Hospital")}
              </Link>
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
