// Stub for the horror email feature called from app/question/page.js.
// Replace the body with a real provider (Resend, Postmark, SES, etc.) when ready.
export async function POST(request) {
  let payload;
  try {
    payload = await request.json();
  } catch {
    return Response.json(
      { ok: false, error: "invalid_json" },
      { status: 400 }
    );
  }

  if (!payload?.email) {
    return Response.json(
      { ok: false, error: "missing_email" },
      { status: 400 }
    );
  }

  // Visible in the dev-server log so we can confirm the call landed.
  console.log("[send-horror-email] payload:", payload);

  return Response.json({ ok: true, queued: true });
}
