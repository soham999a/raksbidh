import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, ShieldX } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, PageHeader } from "@/components/site/ui-bits";
import { useT } from "@/lib/i18n";
import { DEMO_OTP, isValidPhone, normalizePhone } from "@/lib/logic";
import { seo } from "@/lib/seo";
import { getDB, updateDB } from "@/lib/store";

export const Route = createFileRoute("/delete-my-data")({
  head: () =>
    seo(
      "Delete My Donor Data",
      "Remove your blood donor details from Jotno using your phone number and a one-time code.",
    ),
  component: DeleteData,
});

function DeleteData() {
  const { t } = useT();
  const [step, setStep] = useState<"phone" | "otp" | "done">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [err, setErr] = useState("");

  const sendOtp = () => {
    if (!isValidPhone(phone)) return setErr("Enter a valid 10-digit phone number.");
    if (!getDB().donors.some((d) => normalizePhone(d.phone) === normalizePhone(phone)))
      return setErr("No donor is registered with this number.");
    setErr("");
    setStep("otp");
    toast.info(t("OTP sent (demo). Use 1234."));
  };
  const verify = () => {
    if (otp !== DEMO_OTP) return setErr("Wrong OTP. For the demo, the OTP is 1234.");
    updateDB((d) => {
      d.donors = d.donors.filter((x) => normalizePhone(x.phone) !== normalizePhone(phone));
    });
    setErr("");
    setStep("done");
    toast.success(t("Your data has been deleted."));
  };

  return (
    <>
      <PageHeader
        title={t("Delete my data")}
        subtitle={t("You can remove your donor details anytime. This cannot be undone.")}
        icon={<ShieldX />}
      />
      <section className="container-page max-w-md py-8">
        <div className="surface space-y-4 p-6">
          {step === "phone" && (
            <>
              <Field
                label="Registered phone number"
                error={err}
                hint="Try 90000 00600 (a seeded donor)."
              >
                <Input
                  className="h-11 text-base"
                  inputMode="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </Field>
              <Button size="lg" className="w-full" onClick={sendOtp}>
                {t("Send OTP")}
              </Button>
            </>
          )}
          {step === "otp" && (
            <>
              <p>
                {t("Enter the 4-digit code sent to")} <b>{phone}</b>
              </p>
              <Field label="OTP" error={err} hint="Demo OTP: 1234">
                <Input
                  className="h-14 text-center font-mono text-2xl tracking-[0.5em]"
                  inputMode="numeric"
                  maxLength={4}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                />
              </Field>
              <Button size="lg" variant="emergency" className="w-full" onClick={verify}>
                {t("Verify and delete")}
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setStep("phone");
                  setOtp("");
                  setErr("");
                }}
              >
                {t("Change number")}
              </Button>
            </>
          )}
          {step === "done" && (
            <div className="space-y-3 text-center">
              <CheckCircle2 className="mx-auto size-14 text-success" />
              <p className="text-xl font-bold">{t("Your data has been deleted.")}</p>
              <p className="text-muted-foreground">
                {t("You will no longer be contacted for blood requests.")}
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
