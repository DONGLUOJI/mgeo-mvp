import nodemailer from "nodemailer";

import type { SystemAlertRecord } from "@/lib/db/repository";
import { escapeHtml, getEmailConfig } from "@/lib/contact/email-config";

type SystemAlertEmailPayload = {
  generatedAt: string;
  triggeredAlerts: SystemAlertRecord[];
  resolvedAlerts: SystemAlertRecord[];
};

function formatAlertLine(alert: SystemAlertRecord) {
  return [
    `${alert.severity === "critical" ? "[严重]" : "[提醒]"} ${alert.title}`,
    alert.message,
    alert.detail ? `详情：${alert.detail}` : null,
    `首次发现：${alert.firstSeenAt}`,
    `最近出现：${alert.lastSeenAt}`,
    alert.resolvedAt ? `恢复时间：${alert.resolvedAt}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

export async function sendSystemAlertEmail(payload: SystemAlertEmailPayload) {
  const config = getEmailConfig();

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });

  const subjectPrefix = payload.triggeredAlerts.length
    ? `[MGEO 告警] ${payload.triggeredAlerts.length} 条需关注`
    : `[MGEO 告警恢复] ${payload.resolvedAlerts.length} 条已恢复`;

  const renderedTriggered = payload.triggeredAlerts
    .map(
      (alert) => `
        <div style="padding:16px 18px;border:1px solid ${
          alert.severity === "critical" ? "rgba(180,35,24,0.16)" : "rgba(181,71,8,0.16)"
        };border-radius:16px;background:${
          alert.severity === "critical" ? "rgba(180,35,24,0.04)" : "rgba(181,71,8,0.04)"
        }">
          <div style="font-size:14px;font-weight:700;color:${
            alert.severity === "critical" ? "#b42318" : "#b54708"
          }">${alert.severity === "critical" ? "严重告警" : "提醒"}</div>
          <div style="margin-top:6px;font-size:22px;font-weight:800;color:#111827">${escapeHtml(alert.title)}</div>
          <div style="margin-top:8px;font-size:15px;line-height:1.8;color:#344054">${escapeHtml(alert.message)}</div>
          ${
            alert.detail
              ? `<div style="margin-top:8px;font-size:14px;line-height:1.8;color:#667085">${escapeHtml(alert.detail)}</div>`
              : ""
          }
          <div style="margin-top:10px;font-size:13px;color:#98a2b3">首次发现：${escapeHtml(alert.firstSeenAt)} ｜ 最近出现：${escapeHtml(alert.lastSeenAt)}</div>
        </div>
      `
    )
    .join("");

  const renderedResolved = payload.resolvedAlerts
    .map(
      (alert) => `
        <div style="padding:16px 18px;border:1px solid rgba(15,139,127,0.14);border-radius:16px;background:rgba(15,139,127,0.04)">
          <div style="font-size:14px;font-weight:700;color:#0f8b7f">已恢复</div>
          <div style="margin-top:6px;font-size:20px;font-weight:800;color:#111827">${escapeHtml(alert.title)}</div>
          <div style="margin-top:8px;font-size:15px;line-height:1.8;color:#344054">${escapeHtml(alert.message)}</div>
          <div style="margin-top:10px;font-size:13px;color:#98a2b3">恢复时间：${escapeHtml(alert.resolvedAt || alert.lastSeenAt)}</div>
        </div>
      `
    )
    .join("");

  const html = `
    <div style="font-family:Arial,'PingFang SC','Microsoft YaHei',sans-serif;color:#111827;line-height:1.75">
      <h2 style="margin:0 0 12px">MGEO 系统告警摘要</h2>
      <div style="margin:0 0 20px;color:#667085;font-size:14px">生成时间：${escapeHtml(payload.generatedAt)}</div>
      ${
        payload.triggeredAlerts.length
          ? `<div style="display:grid;gap:12px;margin-bottom:24px">${renderedTriggered}</div>`
          : ""
      }
      ${
        payload.resolvedAlerts.length
          ? `<div style="display:grid;gap:12px">${renderedResolved}</div>`
          : ""
      }
    </div>
  `;

  const text = [
    "MGEO 系统告警摘要",
    `生成时间：${payload.generatedAt}`,
    payload.triggeredAlerts.length ? "\n需关注告警：" : null,
    ...payload.triggeredAlerts.map(formatAlertLine),
    payload.resolvedAlerts.length ? "\n已恢复告警：" : null,
    ...payload.resolvedAlerts.map(formatAlertLine),
  ]
    .filter(Boolean)
    .join("\n");

  await transporter.sendMail({
    from: config.from,
    to: config.to,
    subject: subjectPrefix,
    text,
    html,
    replyTo: config.from,
  });
}
