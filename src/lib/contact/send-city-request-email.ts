import nodemailer from "nodemailer";

import { escapeHtml, getEmailConfig } from "@/lib/contact/email-config";

type CityRequestPayload = {
  region: string;
  brand: string;
  contact: string;
  note?: string;
};

export async function sendCityRequestEmail(payload: CityRequestPayload) {
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

  const subject = `MGEO 城市收录申请 - ${payload.region}`;
  const html = `
    <div style="font-family:Arial,'PingFang SC','Microsoft YaHei',sans-serif;color:#111827;line-height:1.75">
      <h2 style="margin:0 0 20px">收到新的城市 / 区域收录申请</h2>
      <table style="border-collapse:collapse;width:100%;max-width:720px">
        <tbody>
          <tr><td style="padding:10px 0;width:140px;color:#6b7280">申请地区</td><td style="padding:10px 0">${escapeHtml(payload.region)}</td></tr>
          <tr><td style="padding:10px 0;color:#6b7280">品牌 / 公司</td><td style="padding:10px 0">${escapeHtml(payload.brand)}</td></tr>
          <tr><td style="padding:10px 0;color:#6b7280">联系方式</td><td style="padding:10px 0">${escapeHtml(payload.contact)}</td></tr>
          <tr><td style="padding:10px 0;color:#6b7280;vertical-align:top">补充说明</td><td style="padding:10px 0;white-space:pre-wrap">${escapeHtml(payload.note || "-")}</td></tr>
        </tbody>
      </table>
    </div>
  `;

  const text = [
    "收到新的城市 / 区域收录申请",
    `申请地区：${payload.region}`,
    `品牌 / 公司：${payload.brand}`,
    `联系方式：${payload.contact}`,
    `补充说明：${payload.note || "-"}`,
  ].join("\n");

  await transporter.sendMail({
    from: config.from,
    to: config.to,
    subject,
    text,
    html,
    replyTo: config.from,
  });
}
