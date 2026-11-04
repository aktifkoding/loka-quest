/**
 * Transactional email via Resend's HTTP API.
 * Optional: without RESEND_API_KEY the call is a no-op so local development
 * and preview deployments keep working.
 */

type EmailInput = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

export async function sendEmail(input: EmailInput): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.info("[email] skipped (RESEND_API_KEY not set):", input.subject);
    return false;
  }

  const from = process.env.EMAIL_FROM ?? "LokaQuest <noreply@lokaquest.id>";

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [input.to],
        subject: input.subject,
        text: input.text,
        html: input.html,
      }),
    });

    if (!response.ok) {
      console.error("[email] failed:", response.status);
      return false;
    }
    return true;
  } catch (error) {
    console.error("[email] error:", error);
    return false;
  }
}
