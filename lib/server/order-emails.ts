import nodemailer from "nodemailer";

function transporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: false,
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASSWORD
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
          }
        : undefined,
  });
}

export async function sendGuestOrderSuccessEmails(params: {
  orderId: string;
  customerName: string;
  customerEmail: string;
}) {
  const smtpHost = process.env.SMTP_HOST;
  const from = process.env.SMTP_FROM;
  const adminEmail = process.env.ADMIN_EMAIL ?? process.env.admin_email;

  if (!smtpHost || !from || !adminEmail) return;

  const mailer = transporter();
  const customerFirstName = params.customerName.trim().split(" ")[0] || "клиент";

  await Promise.all([
    mailer.sendMail({
      from,
      to: params.customerEmail,
      subject: "Поръчката ви е потвърдена - DigiStart",
      text: `Здравейте, ${customerFirstName},\n\nПлащането по поръчка ${params.orderId} е успешно.\nСъздадохме ваш клиентски профил автоматично и можете да следите статуса от панела си.\n\nПоздрави,\nDigiStart`,
    }),
    mailer.sendMail({
      from,
      to: adminEmail,
      subject: `Нова платена поръчка: ${params.orderId}`,
      text: `Има нова платена поръчка от guest checkout.\n\nПоръчка: ${params.orderId}\nКлиент: ${params.customerName}\nИмейл: ${params.customerEmail}`,
    }),
  ]);
}
