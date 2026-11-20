import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { BellRing, Droplets, LifeBuoy } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BloodChip,
  EmptyState,
  Field,
  NativeSelect,
  PageHeader,
  StatusBadge,
  WardSelect,
  fmtDate,
} from "@/components/site/ui-bits";
import { useT } from "@/lib/i18n";
import { isValidPhone, matchingDonors, todayISO, uid } from "@/lib/logic";
import { seo } from "@/lib/seo";
import { getDB, updateDB, useDB } from "@/lib/store";
import { BLOOD_GROUPS, type BloodGroup, type Urgency } from "@/lib/types";

export const Route = createFileRoute("/blood-requests")({
  head: () =>
    seo(
      "Blood Requests",
      "Post an urgent blood request in Bidhannagar. Matching eligible donors are notified, and requests are listed publicly.",
    ),
  component: BloodRequests,
});

const empty = {
  patientName: "",
  phone: "",
  group: "" as BloodGroup | "",
  units: "1",
  hospital: "",
  ward: "",
  urgency: "Urgent" as Urgency,
};

function BloodRequests() {
  const { t } = useT();
  const db = useDB();
  const [f, setF] = useState(empty);
  const [e, setE] = useState<Record<string, string>>({});
  const [last, setLast] = useState<number | null>(null);

  const submit = () => {
    const er: Record<string, string> = {};
    const units = Number(f.units);
    if (f.patientName.trim().length < 2) er.patientName = "Please enter the patient's name.";
    if (!isValidPhone(f.phone)) er.phone = "Enter a valid 10-digit phone number.";
    if (!f.group) er.group = "Please choose the blood group.";
    if (!Number.isInteger(units) || units < 1 || units > 10)
      er.units = "Units must be between 1 and 10.";
    if (f.hospital.trim().length < 2) er.hospital = "Please enter the hospital name.";
    if (!f.ward) er.ward = "Please choose the ward.";
    setE(er);
    if (Object.keys(er).length || !f.group) return;
    const group = f.group;
    const matched = matchingDonors(getDB().donors, group).length;
    updateDB((d) => {
      d.bloodRequests.unshift({
        id: uid("BR-"),
        patientName: f.patientName.trim(),
        phone: f.phone.trim(),
        group,
        units,
        hospital: f.hospital.trim(),
        ward: Number(f.ward),
        urgency: f.urgency,
        matched,
        status: "New",
        createdAt: todayISO(),
      });
    });
    setLast(matched);
    setF(empty);
    toast.success(`${matched} ${t("matching donors notified (demo)")}`);
  };

  return (
    <>
      <PageHeader
        title={t("Blood Requests")}
        subtitle={t("Post a request and we alert eligible donors of the same blood group.")}
        icon={<LifeBuoy />}
      />
      <section className="container-page grid gap-6 py-8 lg:grid-cols-[1fr_1.3fr]">
        <div className="surface h-fit space-y-4 p-6">
          <h2 className="text-2xl font-bold">{t("Post a blood request")}</h2>
          {last !== null && (
            <p className="flex items-center gap-2 rounded-lg bg-success-soft p-3 font-semibold text-success">
              <BellRing className="size-5" /> {last} {t("matching donors notified (demo)")}
            </p>
          )}
          <Field label="Patient name" error={e.patientName}>
            <Input
              className="h-11"
              value={f.patientName}
              onChange={(x) => setF({ ...f, patientName: x.target.value })}
            />
          </Field>
          <Field label="Contact phone" error={e.phone}>
            <Input
              className="h-11"
              inputMode="tel"
              value={f.phone}
              onChange={(x) => setF({ ...f, phone: x.target.value })}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Blood group" error={e.group}>
              <NativeSelect
                value={f.group}
                onChange={(x) => setF({ ...f, group: x.target.value as BloodGroup })}
              >
                <option value="">{t("Choose")}</option>
                {BLOOD_GROUPS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </NativeSelect>
            </Field>
            <Field label="Units" error={e.units}>
              <Input
                className="h-11"
                inputMode="numeric"
                value={f.units}
                onChange={(x) => setF({ ...f, units: x.target.value })}
              />
            </Field>
            <Field label="Ward" error={e.ward}>
              <WardSelect
                value={f.ward}
                onChange={(v) => setF({ ...f, ward: v })}
                allLabel="Choose ward"
              />
            </Field>
            <Field label="Urgency">
              <NativeSelect
                value={f.urgency}
                onChange={(x) => setF({ ...f, urgency: x.target.value as Urgency })}
              >
                {(["Normal", "Urgent", "Critical"] as const).map((u) => (
                  <option key={u} value={u}>
                    {t(u)}
                  </option>
                ))}
              </NativeSelect>
            </Field>
          </div>
          <Field label="Hospital" error={e.hospital}>
            <Input
              className="h-11"
              value={f.hospital}
              onChange={(x) => setF({ ...f, hospital: x.target.value })}
            />
          </Field>
          <Button size="xl" variant="emergency" className="w-full" onClick={submit}>
            <Droplets /> {t("Post request")}
          </Button>
        </div>
        <div className="space-y-3">
          <h2 className="text-2xl font-bold">{t("Open requests")}</h2>
          {db.bloodRequests.length === 0 ? (
            <EmptyState title="No blood requests right now" />
          ) : (
            db.bloodRequests.map((r) => (
              <article key={r.id} className="surface flex gap-4 p-4">
                <BloodChip group={r.group} active />
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold">
                      {r.units} {t("units")} · {r.hospital}
                    </p>
                    <Badge
                      variant={
                        r.urgency === "Critical"
                          ? "danger"
                          : r.urgency === "Urgent"
                            ? "warning"
                            : "muted"
                      }
                    >
                      {t(r.urgency)}
                    </Badge>
                    <StatusBadge status={r.status} />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t("Ward")} {r.ward} · {fmtDate(r.createdAt)} · {t("Patient")}: {r.patientName}
                  </p>
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-success">
                    <BellRing className="size-4" /> {r.matched} {t("matching donors notified")}
                  </p>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </>
  );
}
