import nodemailer from "nodemailer";

const isGmail = process.env.SMTP_HOST?.includes("gmail");

export const mailer = nodemailer.createTransport(
  isGmail
    ? {
        service: "gmail",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      }
    : {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure:
          process.env.SMTP_SECURE === "true" ||
          Number(process.env.SMTP_PORT) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      }
);

export const sendPasswordResetEmail = async ({ email, name, resetUrl }) => {
  const ttl = process.env.PASSWORD_RESET_TOKEN_TTL_MINUTES || 15;

  await mailer.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to: email,
    subject: "Đặt lại mật khẩu",
    text: `Chào ${name || "bạn"},\n\nBạn đã yêu cầu đặt lại mật khẩu. Mở link sau để đặt lại: ${resetUrl}\n\nLink hết hạn sau ${ttl} phút. Nếu bạn không yêu cầu, hãy bỏ qua email này.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
        <h2 style="color: #2563eb;">Yêu cầu đặt lại mật khẩu</h2>
        <p>Xin chào <strong>${name || "bạn"}</strong>,</p>
        <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Nhấn vào nút bên dưới để tiến hành đặt lại mật khẩu:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" target="_blank" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Đặt lại mật khẩu
          </a>
        </div>
        <p style="font-size: 13px; color: #666;">Hoặc copy đường dẫn sau vào trình duyệt nếu nút không hoạt động:</p>
        <p style="font-size: 13px; word-break: break-all; color: #2563eb;">${resetUrl}</p>
        <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
        <p style="font-size: 12px; color: #888;">Liên kết này sẽ hết hạn sau <strong>${ttl} phút</strong>. Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
      </div>
    `,
  });
};
