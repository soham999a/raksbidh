import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { BarChart3 } from "lucide-react";
import { PageHeader, WardSelect } from "@/components/site/ui-bits";
import { useT } from "@/lib/i18n";
import { seo } from "@/lib/seo";
import { useDB } from "@/lib/store";
import { BLOOD_GROUPS } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/ward-stats")({
  head: () =>
    seo(
      "Ward-wise Donor Stats",
      "Donors per blood group in every Bidhannagar ward, and which wards have completed the health survey.",
    ),
  component: WardStats,
});

function WardStats() {
  const { t } = useT();
  const db = useDB();
  const [ward, setWard] = useState("");
  const [onlyWithDonors, setOnly] = useState(true);
  const donors = ward ? db.donors.filter((d) => String(d.ward) === ward) : db.donors;
  const byGroup = BLOOD_GROUPS.map((g) => ({ g, n: donors.filter((d) => d.group === g).length }));
  const max = Math.max(1, ...byGroup.map((x) => x.n));
  const rows = useMemo(
    () =>
      db.wards
        .map((w) => ({
          w,
          counts: BLOOD_GROUPS.map(
            (g) => db.donors.filter((d) => d.ward === w.number && d.group === g).length,
          ),
        }))
        .filter((r) => !onlyWithDonors || r.counts.some((c) => c > 0)),
    [db.wards, db.donors, onlyWithDonors],
  );
  const surveyed = db.wards.filter((w) => w.surveyStatus === "Surveyed").length;

  return (
    <>
      <PageHeader
        title={t("Ward-wise stats")}
        subtitle={t("Donors per blood group per ward, and survey progress across Bidhannagar.")}
        icon={<BarChart3 />}
      />
      <section className="container-page space-y-8 py-8">
        <div className="surface p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold">{t("Donors per blood group")}</h2>
            <WardSelect value={ward} onChange={setWard} className="max-w-xs" />
          </div>
          <div
            className="flex h-56 items-end gap-2 sm:gap-4"
            role="img"
            aria-label={t("Bar chart of donors per blood group")}
          >
            {byGroup.map(({ g, n }) => (
              <div key={g} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                <span className="text-sm font-bold">{n}</span>
                <div
                  className="w-full rounded-t-lg bg-emergency transition-all"
                  style={{ height: `${(n / max) * 100}%`, minHeight: n ? 6 : 2 }}
                />
                <span className="text-sm font-bold text-emergency">{g}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="surface p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold">{t("Survey status by ward")}</h2>
            <p className="text-sm text-muted-foreground">
              <b className="text-success">{surveyed}</b> {t("surveyed")} ·{" "}
              <b>{db.wards.length - surveyed}</b> {t("pending")}
            </p>
          </div>
          <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-9 lg:grid-cols-12">
            {db.wards.map((w) => (
              <div
                key={w.id}
                title={`${t("Ward")} ${w.number}: ${t(w.surveyStatus)}`}
                className={cn(
                  "flex aspect-square flex-col items-center justify-center rounded-lg text-sm font-bold",
                  w.surveyStatus === "Surveyed"
                    ? "bg-success text-success-foreground"
                    : "border border-dashed bg-muted text-muted-foreground",
                )}
              >
                {w.number}
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-4 text-sm">
            <span className="flex items-center gap-1.5">
              <span className="size-3 rounded bg-success" /> {t("Surveyed")}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-3 rounded border border-dashed bg-muted" /> {t("Pending")}
            </span>
          </div>
        </div>

        <div className="surface overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 p-5">
            <h2 className="text-xl font-bold">{t("Donor table")}</h2>
            <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold">
              <input
                type="checkbox"
                checked={onlyWithDonors}
                onChange={(e) => setOnly(e.target.checked)}
                className="size-4 accent-primary"
              />
              {t("Only wards with donors")}
            </label>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary">
                <tr>
                  <th className="px-3 py-2 text-left">{t("Ward")}</th>
                  {BLOOD_GROUPS.map((g) => (
                    <th key={g} className="px-3 py-2 text-emergency">
                      {g}
                    </th>
                  ))}
                  <th className="px-3 py-2">{t("Total")}</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={10} className="p-6 text-center text-muted-foreground">
                      {t("No donors registered yet.")}
                    </td>
                  </tr>
                )}
                {rows.map(({ w, counts }) => (
                  <tr key={w.id} className="border-t">
                    <td className="px-3 py-2 font-semibold">
                      {t("Ward")} {w.number}
                    </td>
                    {counts.map((c, i) => (
                      <td
                        key={i}
                        className={cn("px-3 py-2 text-center", c === 0 && "text-muted-foreground")}
                      >
                        {c}
                      </td>
                    ))}
                    <td className="px-3 py-2 text-center font-bold">
                      {counts.reduce((a, b) => a + b, 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}
