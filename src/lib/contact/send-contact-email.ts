import nodemailer from "nodemailer";

import { escapeHtml, getEmailConfig } from "@/lib/contact/email-config";

type ContactPayload = {
  name: string;
  company: string;
  phone: string;
  industry?: string;
  message: string;
};

export async function sendContactEmail(payload: ContactPayload) {
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

  const subject = `MGEO 提交咨询 - ${payload.company || payload.name}`;
  const html = `
    <div style="font-family:Arial,'PingFang SC','Microsoft YaHei',sans-serif;color:#111827;line-height:1.75">
      <h2 style="margin:0 0 20px">收到新的提交咨询</h2>
      <table style="border-collapse:collapse;width:100%;max-width:720px">
        <tbody>
          <tr><td style="padding:10px 0;width:120px;color:#6b7280">姓名</td><td style="padding:10px 0">${escapeHtml(payload.name)}</td></tr>
          <tr><td style="padding:10px 0;color:#6b7280">公司 / 品牌</td><td style="padding:10px 0">${escapeHtml(payload.company)}</td></tr>
          <tr><td style="padding:10px 0;color:#6b7280">联系电话</td><td style="padding:10px 0">${escapeHtml(payload.phone)}</td></tr>
          <tr><td style="padding:10px 0;color:#6b7280">所属行业</td><td style="padding:10px 0">${escapeHtml(payload.industry || "-")}</td></tr>
          <tr><td style="padding:10px 0;color:#6b7280;vertical-align:top">需求描述</td><td style="padding:10px 0;white-space:pre-wrap">${escapeHtml(payload.message)}</td></tr>
        </tbody>
      </table>
    </div>
  `;

  const text = [
    "收到新的提交咨询",
    `姓名：${payload.name}`,
    `公司 / 品牌：${payload.company}`,
    `联系电话：${payload.phone}`,
    `所属行业：${payload.industry || "-"}`,
    `需求描述：${payload.message}`,
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
