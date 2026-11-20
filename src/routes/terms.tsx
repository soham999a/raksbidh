import { createFileRoute } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { PageHeader } from "@/components/site/ui-bits";
import { useT } from "@/lib/i18n";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/terms")({
  head: () =>
    seo("Terms of Use", "Terms for using the Praner Pashe community health directory demo."),
  component: Terms,
});

const sections = [
  {
    title: "Demo purpose",
    body: "Praner Pashe is a community-health demonstration for Bidhannagar. All listings, doctors, donors and articles shown are sample data created for demonstration.",
  },
  {
    title: "Not medical advice",
    body: "Information here is for general awareness only. It is not a diagnosis or a substitute for advice from a qualified doctor. In an emergency, call your local emergency number immediately.",
  },
  {
    title: "Verify before you rely",
    body: "Phone numbers and addresses in the demo are illustrative. Always confirm a provider's details through an official source before making health decisions.",
  },
  {
    title: "Community conduct",
    body: "Do not use this platform to harass anyone, post false requests, or publish another person's private information. Reports can be sent through the report button on listings.",
  },
  {
    title: "Changes",
    body: "These terms may change as the demo evolves. Continued use means you accept the current version shown on this page.",
  },
];

function Terms() {
  const { t } = useT();
  return (
    <>
      <PageHeader
        title={t("Terms of Use")}
        subtitle={t("Please read these short notes before using the directory.")}
        icon={<FileText />}
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
