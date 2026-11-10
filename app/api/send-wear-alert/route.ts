import { NextResponse } from "next/server";
import {
  sendWearUpdateEmail,
  verifySmtpConnection,
  isSmtpConfigured,
  formatSmtpError,
  WearUpdatePayload,
} from "@/utils/emailService";

export async function POST(req: Request) {
  try {
    const body: WearUpdatePayload = await req.json();

    if (!body || !body.linerId || body.newWear === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required payload fields: linerId, newWear, counts",
        },
        { status: 400 }
      );
    }

    // Default counts if not provided
    const counts = body.counts || {
      healthy: 0,
      monitor: 0,
      action: 0,
      critical: 0,
      total: 0,
    };

    const payload: WearUpdatePayload = {
      ...body,
      counts,
    };

    const result = await sendWearUpdateEmail(payload);

    return NextResponse.json(result, { status: result.success ? 200 : 500 });
  } catch (error: any) {
    const formattedError = formatSmtpError(error);
    console.error("[API send-wear-alert] Error handling wear alert:", formattedError);
    return NextResponse.json(
      {
        success: false,
        error: formattedError,
      },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const isTest = searchParams.get("test") === "true";

  const configured = isSmtpConfigured();

  if (isTest) {
    // Dispatch a test alert email to verify the setup end-to-end
    const testResult = await sendWearUpdateEmail({
      linerId: "1A",
      fullCode: "CH-001·1A-TEST",
      partNo: "PN-001-A",
      chute: "CH-001 — Crusher Area",
      assembly: "PART No. 1",
      zone: "Upper Chute Test Zone",
      previousWear: 45.0,
      newWear: 62.5,
      wearDelta: 17.5,
      previousStatus: "monitor",
      newStatus: "action",
      remainingThickness: 11.2,
      minAcceptable: 10.0,
      origThickness: 30,
      wearRateDay: 0.82,
      wearRateMonth: 6.8,
      rulDays: 14,
      counts: {
        healthy: 18,
        monitor: 12,
        action: 8,
        critical: 2,
        total: 40,
      },
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      action: "send_test_email",
      smtpConfigured: configured,
      result: testResult,
    });
  }

  // Check connection status
  const connectionCheck = await verifySmtpConnection();

  return NextResponse.json({
    service: "DWMS Wear Alert SMTP Notification Service",
    smtpConfigured: configured,
    smtpHost: process.env.SMTP_HOST || "Not configured",
    smtpPort: process.env.SMTP_PORT || "587",
    smtpUser: process.env.SMTP_USER || process.env.SMTP_USERNAME ? "Configured" : "Not configured",
    alertRecipient: process.env.ALERT_EMAIL_TO || process.env.SMTP_TO || "Not configured",
    connection: connectionCheck,
    help: "Add ?test=true to this URL to trigger a test wear update notification email.",
  });
}
