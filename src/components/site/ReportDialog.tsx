import { useState } from "react";
import { Flag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useT } from "@/lib/i18n";
import { uid } from "@/lib/logic";
import { updateDB } from "@/lib/store";
import type { Report } from "@/lib/types";
import { Field } from "./ui-bits";

export function ReportButton({
  entityType,
  entityId,
  entityName,
}: {
  entityType: Report["entityType"];
  entityId: string;
  entityName: string;
}) {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const submit = () => {
    if (msg.trim().length < 5) {
      setErr("Please describe what is wrong (at least 5 characters).");
      return;
    }
    updateDB((db) => {
      db.reports.unshift({
        id: uid("R-"),
        entityType,
        entityId,
        entityName,
        message: msg.trim(),
        status: "New",
        createdAt: new Date().toISOString().slice(0, 10),
      });
    });
    toast.success(t("Thank you! Your report was sent to the admin team."));
    setOpen(false);
    setMsg("");
    setErr("");
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className="text-muted-foreground"
      >
        <Flag /> {t("Report wrong info")}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("Report wrong info")}</DialogTitle>
            <DialogDescription>{entityName}</DialogDescription>
          </DialogHeader>
          <Field label="What is wrong?" error={err}>
            <Textarea
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              rows={4}
              placeholder={t("e.g. Phone number is not reachable")}
            />
          </Field>
          <DialogFooter>
            <Button onClick={submit} size="lg">
              {t("Send report")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
