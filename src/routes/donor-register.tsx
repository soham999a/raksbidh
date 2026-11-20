import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Field, NativeSelect, PageHeader, WardSelect } from "@/components/site/ui-bits";
import { useT } from "@/lib/i18n";
import { isValidPhone, normalizePhone, todayISO, uid } from "@/lib/logic";
import { seo } from "@/lib/seo";
import { getDB, updateDB } from "@/lib/store";
import { BLOOD_GROUPS, type BloodGroup } from "@/lib/types";

export const Route = createFileRoute("/donor-register")({
  head: () =>
    seo(
      "Register as a Blood Donor",
      "Join the Bidhannagar ward-wise blood donor list. Your phone number stays private and you can delete your data anytime.",
    ),
  component: Register,
});

const empty = {
  name: "",
  age: "",
  group: "" as BloodGroup | "",
  ward: "",
  area: "",
  phone: "",
  lastDonation: "",
  willing: "yes",
  consent: false,
};

function Register() {
  const { t } = useT();
  const [f, setF] = useState(empty);
  const [e, setE] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  const submit = () => {
    const er: Record<string, string> = {};
    const age = Number(f.age);
    if (f.name.trim().length < 2) er.name = "Please enter your name.";
    if (!Number.isInteger(age) || age < 18 || age > 65)
      er.age = "Donors must be between 18 and 65 years old.";
    if (!f.group) er.group = "Please choose your blood group.";
    if (!f.ward) er.ward = "Please choose your ward.";
    if (f.area.trim().length < 2) er.area = "Please enter your area.";
    if (!isValidPhone(f.phone)) er.phone = "Enter a valid 10-digit phone number.";
    else if (getDB().donors.some((d) => normalizePhone(d.phone) === normalizePhone(f.phone)))
      er.phone = "This phone number is already registered.";
    if (f.lastDonation && f.lastDonation > todayISO())
      er.lastDonation = "Date cannot be in the future.";
    if (!f.consent) er.consent = "Please give consent to be listed.";
    setE(er);
    if (Object.keys(er).length || !f.group) return;
    const group = f.group;
    updateDB((d) => {
      d.donors.unshift({
        id: uid("dn"),
        name: f.name.trim(),
        age,
        group,
        ward: Number(f.ward),
        area: f.area.trim(),
        phone: f.phone.trim(),
        lastDonation: f.lastDonation || null,
        willing: f.willing === "yes",
        consent: true,
        createdAt: todayISO(),
      });
    });
    toast.success(t("Thank you for registering as a donor!"));
    setDone(true);
    setF(empty);
  };

  if (done)
    return (
      <div className="container-page max-w-xl py-12">
        <div className="surface space-y-4 p-6 text-center">
          <CheckCircle2 className="mx-auto size-16 text-success" />
          <h1 className="text-3xl font-bold">{t("You are now a registered donor")}</h1>
          <p className="text-muted-foreground">
            {t("You will only be contacted for blood requests. You can delete your data anytime.")}
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            <Button asChild size="lg">
              <Link to="/donors">{t("See donor list")}</Link>
            </Button>
            <Button variant="outline" size="lg" onClick={() => setDone(false)}>
              {t("Register another")}
            </Button>
          </div>
        </div>
      </div>
    );

  return (
    <>
      <PageHeader
        title={t("Register as a donor")}
        subtitle={t("One unit of blood can save up to three lives.")}
        icon={<UserPlus />}
      />
      <section className="container-page max-w-2xl py-8">
        <div className="surface grid gap-4 p-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Full name" error={e.name}>
              <Input
                className="h-11 text-base"
                value={f.name}
                onChange={(x) => setF({ ...f, name: x.target.value })}
              />
            </Field>
          </div>
          <Field label="Age" error={e.age}>
            <Input
              className="h-11 text-base"
              inputMode="numeric"
              value={f.age}
              onChange={(x) => setF({ ...f, age: x.target.value })}
            />
          </Field>
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
          <Field label="Ward number" error={e.ward}>
            <WardSelect
              value={f.ward}
              onChange={(v) => setF({ ...f, ward: v })}
              allLabel="Choose ward"
            />
          </Field>
          <Field label="Area" error={e.area}>
            <Input
              className="h-11 text-base"
              placeholder="e.g. Salt Lake Sector II"
              value={f.area}
              onChange={(x) => setF({ ...f, area: x.target.value })}
            />
          </Field>
          <Field label="Phone number" error={e.phone} hint="Never shown publicly.">
            <Input
              className="h-11 text-base"
              inputMode="tel"
              value={f.phone}
              onChange={(x) => setF({ ...f, phone: x.target.value })}
            />
          </Field>
          <Field
            label="Last donation date"
            error={e.lastDonation}
            hint="Leave empty if never donated."
          >
            <Input
              className="h-11 text-base"
              type="date"
              max={todayISO()}
              value={f.lastDonation}
              onChange={(x) => setF({ ...f, lastDonation: x.target.value })}
            />
          </Field>
          <Field label="Willing to donate?">
            <NativeSelect
              value={f.willing}
              onChange={(x) => setF({ ...f, willing: x.target.value })}
            >
              <option value="yes">{t("Yes")}</option>
              <option value="no">{t("No")}</option>
            </NativeSelect>
          </Field>
          <div className="sm:col-span-2">
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border bg-primary-soft p-4">
              <Checkbox
                checked={f.consent}
                onCheckedChange={(c) => setF({ ...f, consent: c === true })}
                className="mt-1 size-5"
              />
              <span>
                {t("I agree to be contacted for blood requests. I can delete my data anytime.")}
              </span>
            </label>
            {e.consent && (
              <p className="mt-1 text-sm font-medium text-destructive">{t(e.consent)}</p>
            )}
          </div>
          <Button size="xl" className="sm:col-span-2" onClick={submit}>
            {t("Register")}
          </Button>
        </div>
      </section>
    </>
  );
}
