import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/site/ui-bits";
import { useT } from "@/lib/i18n";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/privacy")({
  head: () =>
    seo(
      "Privacy Policy",
      "How Jotno handles the information you enter while using the community health directory.",
    ),
  component: Privacy,
});

const sections = [
  {
    title: "What we store",
    body: "This demo keeps the directory, your bookings and requests only in this browser's local storage. Nothing is uploaded to a server, and no account or password is created.",
  },
  {
    title: "Information you choose to share",
    body: "If you register as a donor or post a request, the name, phone number and location you type are saved locally so the demo can show matching flows. Only share real details on a production service you trust.",
  },
  {
    title: "Cookies and analytics",
    body: "We do not use advertising cookies, tracking pixels or third-party analytics. Language preference is stored locally on your device.",
  },
  {
    title: "Your choices",
    body: "You can clear all saved demo data at any time from the Delete My Data page, or clear this site's storage in your browser settings.",
  },
  {
    title: "Contact",
    body: "For questions about this demo, use the 24×7 Helpline page. Emergency medical help should always come from your local emergency services.",
  },
];

function Privacy() {
  const { t } = useT();
  return (
    <>
      <PageHeader
        title={t("Privacy Policy")}
        subtitle={t("Plain-language notes on how this demo handles your information.")}
        icon={<ShieldCheck />}
      />
      <section className="container-page grid gap-4 py-8 md:grid-cols-2">
        {sections.map((s, i) => (
          <div key={s.title} className="surface p-6">
            <p className="text-sm font-bold text-primary-strong">
              {String(i + 1).padStart(2, "0")}
            </p>
            <h2 className="mt-1 text-xl font-bold">{t(s.title)}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t(s.body)}</p>
          </div>
        ))}
      </section>
    </>
  );
}
