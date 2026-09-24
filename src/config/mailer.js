import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";

const getMailer = () => {
  const isGmail = process.env.SMTP_HOST?.includes("gmail");

  if (isGmail) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT || 465),
    secure:
      process.env.SMTP_SECURE === "true" ||
      Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export const sendPasswordResetEmail = async ({ email, name, resetUrl }) => {
  const ttl = process.env.PASSWORD_RESET_TOKEN_TTL_MINUTES || 15;
  const mailer = getMailer();

  await mailer.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to: email,
    subject: "Đặt lại mật khẩu",
    text: `Chào ${name || "bạn"},\n\nBạn đã yêu cầu đặt lại mật khẩu. Mở link sau để đặt lại mật khẩu của bạn: ${resetUrl}\n\nLink hết hạn sau ${ttl} phút. Nếu bạn không yêu cầu, hãy bỏ qua email này.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #eaeaea; border-radius: 12px; background-color: #ffffff;">
        <h2 style="color: #2563eb; margin-top: 0;">Yêu cầu đặt lại mật khẩu</h2>
        <p>Xin chào <strong>${name || "bạn"}</strong>,</p>
        <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Nhấn vào nút bên dưới để tiến hành đặt lại mật khẩu:</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetUrl}" target="app_window" style="background-color: #2563eb; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);">
            Đặt lại mật khẩu
          </a>
        </div>
        <hr style="border: none; border-top: 1px solid #f0f0f0; margin: 24px 0;" />
        <p style="font-size: 12px; color: #888; margin-bottom: 0;">Liên kết này có hiệu lực trong vòng <strong>${ttl} phút</strong>. Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email và tài khoản của bạn vẫn an toàn.</p>
      </div>
    `,
  });
};
