import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { Droplets, MapPin } from "lucide-react";
import { ReportButton } from "@/components/site/ReportDialog";
import {
  BloodChip,
  CallButton,
  EmptyState,
  PageHeader,
  Verified,
  WardSelect,
} from "@/components/site/ui-bits";
import { useT } from "@/lib/i18n";
import { seo } from "@/lib/seo";
import { useDB } from "@/lib/store";
import { BLOOD_GROUPS } from "@/lib/types";

const search = z.object({ focus: z.string().optional().catch(undefined) });

export const Route = createFileRoute("/blood-banks")({
  validateSearch: search,
  head: () =>
    seo(
      "Blood Banks",
      "Find Bidhannagar blood banks by blood group and ward, see which groups are available now, and call in one tap.",
    ),
  component: BloodBanks,
});

function BloodBanks() {
  const { t } = useT();
  const db = useDB();
  const s = Route.useSearch();
  const [group, setGroup] = useState("");
  const [ward, setWard] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (s.focus === "1") ref.current?.querySelector("button")?.focus();
  }, [s.focus]);

  const list = useMemo(
    () =>
      db.bloodBanks.filter(
        (b) => (!group || b.groups.includes(group as never)) && (!ward || String(b.ward) === ward),
      ),
    [db.bloodBanks, group, ward],
  );

  return (
    <>
      <PageHeader
        title={t("Blood Bank Directory")}
        subtitle={t("Tap a blood group to see which blood banks have it right now.")}
        icon={<Droplets />}
      >
        <div className="surface space-y-3 p-3">
          <div ref={ref} className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setGroup("")}
              className={`min-h-10 cursor-pointer rounded-full border px-4 text-sm font-bold ${group === "" ? "border-ink bg-ink text-ink-foreground" : "bg-card"}`}
            >
              {t("All groups")}
            </button>
            {BLOOD_GROUPS.map((g) => (
              <BloodChip
                key={g}
                group={g}
                active={group === g}
                onClick={() => setGroup(group === g ? "" : g)}
              />
            ))}
          </div>
          <WardSelect value={ward} onChange={setWard} className="md:max-w-xs" />
        </div>
      </PageHeader>
      <section className="container-page py-8">
        <p className="mb-4 text-sm text-muted-foreground">
          {list.length} {t("results")}
        </p>
        {list.length === 0 ? (
          <EmptyState
            title="No blood bank has this group in this ward"
            hint="Try All wards, or post a blood request so donors are notified."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {list.map((b) => (
              <article key={b.id} className="surface flex flex-col gap-3 p-5">
                <h2 className="text-xl font-bold">{b.name}</h2>
                <p className="flex items-start gap-2 text-muted-foreground">
                  <MapPin className="mt-1 size-4 shrink-0" /> {b.address} · {t("Ward")} {b.ward}
                </p>
                <p className="font-semibold">{b.contactPerson}</p>
                <p className="font-mono text-lg">{b.phone}</p>
                <div>
                  <p className="mb-2 text-sm font-semibold text-muted-foreground">
                    {t("Available now")}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {b.groups.length === 0 ? (
                      <span className="text-sm text-muted-foreground">{t("None listed")}</span>
                    ) : (
                      b.groups.map((g) => <BloodChip key={g} group={g} active={g === group} />)
                    )}
                  </div>
                </div>
                <Verified date={b.lastVerified} label="Last updated" />
                <div className="mt-auto flex flex-wrap items-center gap-2">
                  <CallButton phone={b.phone} size="lg" className="flex-1 sm:flex-none" />
                  <ReportButton entityType="Blood Bank" entityId={b.id} entityName={b.name} />
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
