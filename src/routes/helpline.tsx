import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Headset } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  CallButton,
  Field,
  NativeSelect,
  PageHeader,
  WardSelect,
  WhatsAppButton,
} from "@/components/site/ui-bits";
import { useT } from "@/lib/i18n";
import { isValidPhone, todayISO, uid } from "@/lib/logic";
import { seo } from "@/lib/seo";
import { updateDB, useDB } from "@/lib/store";
import type { Ticket } from "@/lib/types";

export const Route = createFileRoute("/helpline")({
  head: () =>
    seo(
      "24x7 Helpline",
      "Call or WhatsApp the Praner Pashe 24x7 helpline, or request a callback for blood, ambulance or hospital help.",
    ),
  component: Helpline,
});

const empty = { name: "", phone: "", issue: "Blood" as Ticket["issue"], ward: "", note: "" };

function Helpline() {
  const { t } = useT();
  const db = useDB();
  const [f, setF] = useState(empty);
  const [e, setE] = useState<Record<string, string>>({});
  const [done, setDone] = useState<string | null>(null);

  const submit = () => {
    const er: Record<string, string> = {};
    if (f.name.trim().length < 2) er.name = "Please enter your name.";
    if (!isValidPhone(f.phone)) er.phone = "Enter a valid 10-digit phone number.";
    if (!f.ward) er.ward = "Please choose your ward.";
    setE(er);
    if (Object.keys(er).length) return;
    const id = uid("T-");
    updateDB((d) => {
      d.tickets.unshift({
        id,
        name: f.name.trim(),
        phone: f.phone.trim(),
        issue: f.issue,
        ward: Number(f.ward),
        note: f.note.trim(),
        status: "New",
        createdAt: todayISO(),
      });
    });
    setDone(id);
    setF(empty);
    toast.success(t("Callback requested. We will call you shortly."));
  };

  return (
    <>
      <PageHeader
        title={t("24x7 Helpline")}
        subtitle={t(
          "Real people, any time of day or night. Call, WhatsApp, or ask us to call you back.",
        )}
        icon={<Headset />}
      />
      <section className="container-page grid gap-6 py-8 lg:grid-cols-2">
        <div className="surface space-y-4 p-6 text-center">
          <p className="text-muted-foreground">{t("Helpline number")}</p>
          <p className="font-display text-5xl font-extrabold tracking-wide">
            {db.settings.helpline}
          </p>
          <CallButton
            phone={db.settings.helpline}
            label="Call now"
            size="xl"
            className="h-16 w-full text-xl"
          />
          <WhatsAppButton
            phone={db.settings.whatsapp}
            text="Hello Praner Pashe, I need help."
            size="xl"
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">{t("Dummy numbers for the demo.")}</p>
        </div>
        <div className="surface space-y-4 p-6">
          <h2 className="text-2xl font-bold">{t("Request a callback")}</h2>
          {done && (
            <p className="flex items-center gap-2 rounded-lg bg-success-soft p-3 font-semibold text-success">
              <CheckCircle2 className="size-5" /> {t("Request received. Ticket")} {done}
            </p>
          )}
          <Field label="Your name" error={e.name}>
            <Input
              className="h-11 text-base"
              value={f.name}
              onChange={(x) => setF({ ...f, name: x.target.value })}
            />
          </Field>
          <Field label="Phone number" error={e.phone}>
            <Input
              className="h-11 text-base"
              inputMode="tel"
              value={f.phone}
              onChange={(x) => setF({ ...f, phone: x.target.value })}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Issue type">
              <NativeSelect
                value={f.issue}
                onChange={(x) => setF({ ...f, issue: x.target.value as Ticket["issue"] })}
              >
                {(["Blood", "Ambulance", "Hospital", "Other"] as const).map((i) => (
                  <option key={i} value={i}>
                    {t(i)}
                  </option>
                ))}
              </NativeSelect>
            </Field>
            <Field label="Ward" error={e.ward}>
              <WardSelect
                value={f.ward}
                onChange={(v) => setF({ ...f, ward: v })}
                allLabel="Choose ward"
              />
            </Field>
          </div>
          <Field label="Anything else? (optional)">
            <Textarea
              rows={3}
              value={f.note}
              onChange={(x) => setF({ ...f, note: x.target.value })}
            />
          </Field>
          <Button size="xl" className="w-full" onClick={submit}>
            {t("Request callback")}
          </Button>
        </div>
      </section>
    </>
  );
}
