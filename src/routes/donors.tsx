import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { BarChart3, HeartPulse, Lock, MapPin, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  BloodChip,
  EmptyState,
  Field,
  NativeSelect,
  PageHeader,
  WardSelect,
  fmtDate,
} from "@/components/site/ui-bits";
import { useT } from "@/lib/i18n";
import { isEligible, isValidPhone, todayISO, uid } from "@/lib/logic";
import { seo } from "@/lib/seo";
import { updateDB, useDB } from "@/lib/store";
import { BLOOD_GROUPS, type Donor, type Urgency } from "@/lib/types";

export const Route = createFileRoute("/donors")({
  head: () =>
    seo(
      "Blood Donor Database",
      "Search Bidhannagar blood donors by group and ward. Phone numbers stay private; send a contact request instead.",
    ),
  component: Donors,
});

function Donors() {
  const { t } = useT();
  const db = useDB();
  const [group, setGroup] = useState("");
  const [ward, setWard] = useState("");
  const [target, setTarget] = useState<Donor | null>(null);
  const list = useMemo(
    () =>
      db.donors.filter((d) => (!group || d.group === group) && (!ward || String(d.ward) === ward)),
    [db.donors, group, ward],
  );

  return (
    <>
      <PageHeader
        title={t("Blood Group Database")}
        subtitle={t(
          "Ward-wise donors from the Bidhannagar survey. Phone numbers are never shown publicly.",
        )}
        icon={<HeartPulse />}
      >
        <div className="mb-3 flex flex-wrap gap-2">
          <Button asChild>
            <Link to="/donor-register">
              <UserPlus /> {t("Register as donor")}
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/blood-requests">{t("Post a blood request")}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/ward-stats">
              <BarChart3 /> {t("Ward-wise stats")}
            </Link>
          </Button>
          <Button asChild variant="ghost">
            <Link to="/delete-my-data">
              <Trash2 /> {t("Delete my data")}
            </Link>
          </Button>
        </div>
        <div className="surface grid gap-3 p-3 sm:grid-cols-2">
          <NativeSelect
            value={group}
            onChange={(e) => setGroup(e.target.value)}
            aria-label={t("Blood group")}
          >
            <option value="">{t("All blood groups")}</option>
            {BLOOD_GROUPS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </NativeSelect>
          <WardSelect value={ward} onChange={setWard} />
        </div>
      </PageHeader>
      <section className="container-page py-8">
        <p className="mb-4 text-sm text-muted-foreground">
          {list.length} {t("donors found")}
        </p>
        {list.length === 0 ? (
          <EmptyState title="No donors found" hint="Try another ward, or post a blood request." />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((d) => {
              const ok = isEligible(d.lastDonation);
              return (
                <article key={d.id} className="surface flex flex-col gap-2 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h2 className="text-lg font-bold">{d.name}</h2>
                      <p className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="size-3.5" /> {t("Ward")} {d.ward} · {d.area}
                      </p>
                    </div>
                    <BloodChip group={d.group} active />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {ok ? (
                      <Badge variant="success">{t("Eligible to donate")}</Badge>
                    ) : (
                      <Badge variant="muted">{t("Donated recently")}</Badge>
                    )}
                    {!d.willing && <Badge variant="outline">{t("Not available now")}</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t("Last donation")}: {d.lastDonation ? fmtDate(d.lastDonation) : t("Never")}
                  </p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Lock className="size-3" /> {t("Phone hidden for privacy")}
                  </p>
                  <Button
                    className="mt-auto"
                    variant="soft"
                    onClick={() => setTarget(d)}
                    disabled={!d.willing}
                  >
                    {t("Request contact")}
                  </Button>
                </article>
              );
            })}
          </div>
        )}
      </section>
      <RequestContact donor={target} onClose={() => setTarget(null)} />
    </>
  );
}

function RequestContact({ donor, onClose }: { donor: Donor | null; onClose: () => void }) {
  const { t } = useT();
  const [f, setF] = useState({ name: "", phone: "", urgency: "Urgent" as Urgency, hospital: "" });
  const [e, setE] = useState<Record<string, string>>({});
  const submit = () => {
    if (!donor) return;
    const er: Record<string, string> = {};
    if (f.name.trim().length < 2) er.name = "Please enter your name.";
    if (!isValidPhone(f.phone)) er.phone = "Enter a valid 10-digit phone number.";
    if (f.hospital.trim().length < 2) er.hospital = "Please enter the hospital name.";
    setE(er);
    if (Object.keys(er).length) return;
    updateDB((d) => {
      d.contactRequests.unshift({
        id: uid("CR-"),
        donorId: donor.id,
        donorName: donor.name,
        requesterName: f.name.trim(),
        phone: f.phone.trim(),
        urgency: f.urgency,
        hospital: f.hospital.trim(),
        status: "New",
        createdAt: todayISO(),
      });
    });
    toast.success(t("Request sent to the admin team and the donor (demo)."));
    setF({ name: "", phone: "", urgency: "Urgent", hospital: "" });
    onClose();
  };
  return (
    <Dialog open={!!donor} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("Request contact")}</DialogTitle>
          <DialogDescription>
            {donor?.name} · {donor?.group}.{" "}
            {t("We share your request; the donor decides to call back.")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Field label="Your name" error={e.name}>
            <Input
              className="h-11"
              value={f.name}
              onChange={(x) => setF({ ...f, name: x.target.value })}
            />
          </Field>
          <Field label="Phone number" error={e.phone}>
            <Input
              className="h-11"
              inputMode="tel"
              value={f.phone}
              onChange={(x) => setF({ ...f, phone: x.target.value })}
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
          <Field label="Hospital" error={e.hospital}>
            <Input
              className="h-11"
              value={f.hospital}
              onChange={(x) => setF({ ...f, hospital: x.target.value })}
            />
          </Field>
        </div>
        <DialogFooter>
          <Button size="lg" onClick={submit}>
            {t("Send request")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
