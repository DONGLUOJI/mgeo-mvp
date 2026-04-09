import { NextResponse } from "next/server";

import {
  recordSystemAlert,
  resolveSystemAlerts,
  type SystemAlertRecord,
} from "@/lib/db/repository";
import { sendSystemAlertEmail } from "@/lib/contact/send-system-alert-email";
import { evaluateSystemAlerts } from "@/lib/system/alerting";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const evaluation = await evaluateSystemAlerts();
  const persisted = await Promise.all(
    evaluation.alerts.map((alert) =>
      recordSystemAlert({
        alertKey: alert.alertKey,
        severity: alert.severity,
        title: alert.title,
        message: alert.message,
        detail: alert.detail,
        renotifyAfterHours: alert.renotifyAfterHours,
      })
    )
  );

  const currentKeys = evaluation.alerts.map((alert) => alert.alertKey);
  const resolvedAlerts = await resolveSystemAlerts(currentKeys);
  const triggeredAlerts = persisted
    .filter((item) => item.shouldNotify)
    .map((item) => item.alert);

  const emailState: {
    sent: boolean;
    skipped: boolean;
    reason: string | null;
  } = {
    sent: false,
    skipped: false,
    reason: null,
  };

  if (triggeredAlerts.length || resolvedAlerts.length) {
    try {
      await sendSystemAlertEmail({
        generatedAt: evaluation.generatedAt,
        triggeredAlerts,
        resolvedAlerts,
      });
      emailState.sent = true;
    } catch (error) {
      const message = error instanceof Error ? error.message : "UNKNOWN_EMAIL_ERROR";
      if (message === "SMTP_PASS_MISSING") {
        emailState.skipped = true;
        emailState.reason = "SMTP_PASS_MISSING";
      } else {
        emailState.reason = message;
      }
    }
  } else {
    emailState.skipped = true;
    emailState.reason = "NO_CHANGES";
  }

  return NextResponse.json({
    success: true,
    data: {
      generatedAt: evaluation.generatedAt,
      activeAlertCount: evaluation.alerts.length,
      notifiedCount: triggeredAlerts.length,
      resolvedCount: resolvedAlerts.length,
      email: emailState,
      alerts: evaluation.alerts.map((alert) => ({
        key: alert.alertKey,
        severity: alert.severity,
        title: alert.title,
      })),
    },
  });
}
