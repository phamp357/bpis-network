import sgMail from "@sendgrid/mail";

// Server-only. Never import from client components.
let _initialized = false;

function init() {
  if (_initialized) return;
  const key = process.env.SENDGRID_API_KEY;
  if (!key) throw new Error("SENDGRID_API_KEY is not set");
  sgMail.setApiKey(key);
  _initialized = true;
}

export type SendEmailArgs = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  templateId?: string;
  dynamicTemplateData?: Record<string, unknown>;
  from?: string;
  replyTo?: string;
};

export async function sendEmail(args: SendEmailArgs) {
  init();

  const from = args.from ?? process.env.SENDGRID_FROM_EMAIL;
  if (!from) throw new Error("SENDGRID_FROM_EMAIL is not set");

  const msg: sgMail.MailDataRequired = {
    to: args.to,
    from,
    subject: args.subject,
    html: args.html,
    text: args.text ?? stripHtml(args.html),
    ...(args.replyTo ? { replyTo: args.replyTo } : {}),
    ...(args.templateId
      ? { templateId: args.templateId, dynamicTemplateData: args.dynamicTemplateData }
      : {}),
  };

  return sgMail.send(msg);
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}
