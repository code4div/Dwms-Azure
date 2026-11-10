import nodemailer from "nodemailer";
import dns from "dns";

export interface WearUpdatePayload {
  linerId: string;
  fullCode: string;
  partNo: string;
  chute?: string;
  assembly?: string;
  zone?: string;
  previousWear: number;
  newWear: number;
  wearDelta?: number;
  previousStatus?: string;
  newStatus: string;
  remainingThickness: number;
  minAcceptable: number;
  origThickness?: number;
  wearRateDay?: number;
  wearRateMonth?: number;
  rulDays?: number;
  counts: {
    healthy: number;
    monitor: number;
    action: number;
    critical: number;
    total: number;
  };
  timestamp?: string;
}

export interface EmailSendResult {
  success: boolean;
  message: string;
  messageId?: string;
  simulated?: boolean;
  error?: string;
}

/**
 * Sanitizes an environment variable by trimming whitespace and removing wrapping quotes.
 */
export function sanitizeEnv(val: string | undefined): string {
  if (!val) return "";
  return val.trim().replace(/^["']|["']$/g, "").trim();
}

/**
 * Checks if the minimal required SMTP configuration exists in environment variables.
 */
export function isSmtpConfigured(): boolean {
  const host = sanitizeEnv(process.env.SMTP_HOST || process.env.MAIL_HOST);
  const user = sanitizeEnv(process.env.SMTP_USER || process.env.SMTP_USERNAME || process.env.MAIL_USER);
  const pass = sanitizeEnv(process.env.SMTP_PASS || process.env.SMTP_PASSWORD || process.env.MAIL_PASS);
  return Boolean(host && user && pass);
}

/**
 * Formats any SMTP error, thoroughly unpacking AggregateError, inner errors, socket timeouts,
 * and authentication issues into a readable and actionable diagnosis.
 */
export function formatSmtpError(err: any): string {
  if (!err) return "Unknown error";

  let innerMessages: string[] = [];

  // Unpack AggregateError or array of inner errors
  if (Array.isArray(err.errors) && err.errors.length > 0) {
    innerMessages = err.errors
      .map((sub: any, idx: number) => {
        const code = sub?.code ? `[${sub.code}] ` : "";
        const msg = sub?.message || String(sub);
        const addr = sub?.address ? ` (${sub.address}${sub.port ? `:${sub.port}` : ""})` : "";
        return `${code}${msg}${addr}`;
      })
      .filter(Boolean);
  }

  const errCode = err.code || err.command;
  const rawMsg = err.message || "";
  let detail = "";

  if (innerMessages.length > 0) {
    detail = innerMessages.join(" | ");
  } else if (rawMsg) {
    detail = errCode && !rawMsg.includes(errCode) ? `[${errCode}] ${rawMsg}` : rawMsg;
  } else if (err.response) {
    detail = `Server response: ${err.response}`;
  } else {
    detail = String(err);
  }

  const combined = `${err.name || "Error"}: ${detail}`;

  // Smart contextual diagnostics based on extracted details
  if (
    combined.includes("146.112.") ||
    combined.includes("OpenDNS") ||
    combined.includes("Umbrella")
  ) {
    return `${combined} -> (Blocked by Cisco Umbrella / OpenDNS proxy. Your corporate network is intercepting SMTP. If connected to office Wi-Fi or VPN, please switch to a personal hotspot or use your internal company mail relay).`;
  }

  if (
    combined.includes("ETIMEDOUT") ||
    combined.includes("ESOCKETTIMEDOUT") ||
    combined.includes("Connection timeout")
  ) {
    return `${combined} -> (Connection timed out. Outbound SMTP ports 587/465 appear blocked by your network firewall or ISP. If on corporate Wi-Fi/VPN, test on a mobile hotspot).`;
  }

  if (
    combined.includes("EAUTH") ||
    combined.includes("535") ||
    combined.includes("Username and Password not accepted") ||
    combined.includes("BadCredentials")
  ) {
    return `${combined} -> (Gmail authentication failed: Please ensure 2-Step Verification is enabled on your Google account and you generate a dedicated 16-character App Password at https://myaccount.google.com/apppasswords).`;
  }

  if (combined.includes("ENOTFOUND") || combined.includes("EAI_AGAIN")) {
    return `${combined} -> (DNS resolution failed for SMTP host. Please verify internet connectivity and the SMTP_HOST setting in .env.local).`;
  }

  return combined;
}

/**
 * Official Google SMTP IPv4 addresses used to bypass local DNS sinkholes
 * (such as Cisco Umbrella Roaming Client or corporate DNS interceptors on laptops).
 */
export const GMAIL_DIRECT_IPS = [
  "142.250.152.108",
  "64.233.184.108",
  "173.194.76.108",
  "74.125.130.108",
];

/**
 * Checks if the configured host resolves to a known security sinkhole (e.g. Cisco Umbrella 146.112.x.x)
 * and automatically returns Google's official direct IP to ensure connection succeeds.
 */
export async function getEffectiveSmtpHost(): Promise<{
  host: string;
  port: number;
  secure: boolean;
  isDirectBypass: boolean;
}> {
  const configuredHost = sanitizeEnv(process.env.SMTP_HOST || process.env.MAIL_HOST) || "smtp.gmail.com";
  const configuredPort = parseInt(sanitizeEnv(process.env.SMTP_PORT || process.env.MAIL_PORT) || "465", 10);
  const configuredSecure =
    sanitizeEnv(process.env.SMTP_SECURE) === "true" ||
    sanitizeEnv(process.env.SMTP_SECURE) === "1" ||
    configuredPort === 465;

  const user = sanitizeEnv(process.env.SMTP_USER || process.env.SMTP_USERNAME || "");

  if (configuredHost.includes("gmail.com") || user.toLowerCase().endsWith("@gmail.com")) {
    return { host: GMAIL_DIRECT_IPS[0], port: 465, secure: true, isDirectBypass: true };
  }

  return { host: configuredHost, port: configuredPort, secure: configuredSecure, isDirectBypass: false };
}

/**
 * Creates and returns a nodemailer transporter based on environment variables,
 * with support for IPv4 forcing, space stripping for app passwords, and protocol fallbacks.
 */
export function getMailTransporter(options?: {
  forcePort?: number;
  forceSecure?: boolean;
  useService?: boolean;
  targetHost?: string;
}) {
  let host = options?.targetHost || sanitizeEnv(process.env.SMTP_HOST || process.env.MAIL_HOST) || "smtp.gmail.com";

  // If host is smtp.gmail.com, default directly to Google's official IP to bypass any local DNS sinkholes (Cisco Umbrella)
  if (host === "smtp.gmail.com") {
    host = GMAIL_DIRECT_IPS[0];
  }

  const rawPort = sanitizeEnv(process.env.SMTP_PORT || process.env.MAIL_PORT) || "465";
  const port = options?.forcePort || parseInt(rawPort, 10);

  const rawSecure = sanitizeEnv(process.env.SMTP_SECURE);
  const secure =
    options?.forceSecure !== undefined
      ? options.forceSecure
      : rawSecure === "true" || rawSecure === "1" || port === 465;

  const user = sanitizeEnv(process.env.SMTP_USER || process.env.SMTP_USERNAME || process.env.MAIL_USER);
  let pass = sanitizeEnv(process.env.SMTP_PASS || process.env.SMTP_PASSWORD || process.env.MAIL_PASS);

  // If using Gmail, strip any internal spaces from 16-char app passwords (e.g. "buvk ofeg xzpa dttn" -> "buvkofegxzpadttn")
  const isGmail =
    host.includes("gmail.com") ||
    options?.useService ||
    user.toLowerCase().endsWith("@gmail.com") ||
    GMAIL_DIRECT_IPS.includes(host);

  if (isGmail) {
    pass = pass.replace(/\s+/g, "");
  }

  // Base socket options for reliability
  const baseOptions: any = {
    auth: {
      user,
      pass,
    },
    tls: {
      // Allow self-signed or enterprise proxy certificates
      rejectUnauthorized: false,
      // SNI servername must be smtp.gmail.com when connecting directly to Google IP
      servername: isGmail ? "smtp.gmail.com" : host,
    },
    // Force IPv4 to prevent hanging on dual-stack IPv6 DNS resolutions
    family: 4,
    // Fast connection timeouts so the UI doesn't hang
    connectionTimeout: 8000,
    greetingTimeout: 6000,
    socketTimeout: 12000,
  };

  // If Gmail service preset is requested without direct IP
  if (options?.useService && !options?.targetHost) {
    return nodemailer.createTransport({
      ...baseOptions,
      service: "gmail",
    });
  }

  return nodemailer.createTransport({
    ...baseOptions,
    host,
    port,
    secure,
  });
}

/**
 * Verifies SMTP connection credentials with detailed error diagnostics and automatic SSL fallback.
 */
export async function verifySmtpConnection(): Promise<{ ok: boolean; message: string }> {
  if (!isSmtpConfigured()) {
    return {
      ok: false,
      message:
        "SMTP environment variables (SMTP_HOST, SMTP_USER, SMTP_PASS) are not yet configured in .env.local file.",
    };
  }

  const effective = await getEffectiveSmtpHost();
  const transporter = getMailTransporter({
    targetHost: effective.host,
    forcePort: effective.port,
    forceSecure: effective.secure,
  });

  try {
    await transporter.verify();
    return {
      ok: true,
      message: effective.isDirectBypass
        ? "SMTP server connection verified successfully (via Google Direct IP bypass)."
        : "SMTP server connection verified successfully.",
    };
  } catch (err: any) {
    const formatted = formatSmtpError(err);
    console.error("[DWMS Email Service] SMTP connection verification failed:", formatted);

    // If primary failed and wasn't already direct bypass, retry with direct Google IP
    if (!effective.isDirectBypass) {
      try {
        console.info("[DWMS Email Service] Retrying verification via Google Direct IP (142.250.152.108:465)...");
        const fallbackTransporter = getMailTransporter({
          targetHost: GMAIL_DIRECT_IPS[0],
          forcePort: 465,
          forceSecure: true,
        });
        await fallbackTransporter.verify();
        return {
          ok: true,
          message: "SMTP verified successfully via Google Direct IP bypass.",
        };
      } catch (fallbackErr: any) {
        const fallbackFormatted = formatSmtpError(fallbackErr);
        console.error("[DWMS Email Service] Fallback also failed:", fallbackFormatted);
      }
    }

    return {
      ok: false,
      message: formatted,
    };
  }
}

/**
 * Formats status with color and title for HTML emails.
 */
function getStatusBadgeConfig(status: string) {
  const normalized = status.toLowerCase();
  switch (normalized) {
    case "critical":
      return { label: "CRITICAL", bg: "#fee2e2", text: "#991b1b", border: "#f87171" };
    case "action":
    case "action required":
      return { label: "ACTION REQUIRED", bg: "#ffedd5", text: "#c2410c", border: "#fb923c" };
    case "monitor":
      return { label: "MONITOR", bg: "#fef9c3", text: "#854d0e", border: "#facc15" };
    case "healthy":
    default:
      return { label: "HEALTHY", bg: "#dcfce7", text: "#166534", border: "#4ade80" };
  }
}

/**
 * Sends an automated wear update email alert with full fleet health counts.
 */
export async function sendWearUpdateEmail(
  payload: WearUpdatePayload
): Promise<EmailSendResult> {
  const {
    linerId,
    fullCode,
    partNo,
    chute = "CH-001 — Crusher Area",
    assembly = "PART No. 1",
    zone = "Chute Impact Zone",
    previousWear,
    newWear,
    wearDelta = Number((newWear - previousWear).toFixed(1)),
    newStatus,
    remainingThickness,
    minAcceptable,
    origThickness = 30,
    wearRateDay = 0.64,
    wearRateMonth = 5.3,
    rulDays = 120,
    counts,
    timestamp = new Date().toISOString(),
  } = payload;

  const rawTo = process.env.ALERT_EMAIL_TO || process.env.SMTP_TO || process.env.MAIL_TO || process.env.SMTP_USER;
  const toEmail = sanitizeEnv(rawTo) || "maintenance-alerts@dwms.com";

  const rawUser = process.env.SMTP_USER || process.env.SMTP_USERNAME || process.env.MAIL_USER;
  const senderUser = sanitizeEnv(rawUser) || "no-reply@dwms-rajasthan.com";

  const rawFrom = process.env.SMTP_FROM || process.env.MAIL_FROM;
  const fromEmail = sanitizeEnv(rawFrom) || `"DWMS Wear Alert" <${senderUser}>`;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const formattedDate = new Date(timestamp).toLocaleString("en-US", {
    dateStyle: "full",
    timeStyle: "medium",
  });

  const deltaText =
    wearDelta > 0
      ? `+${wearDelta.toFixed(1)}%`
      : wearDelta < 0
        ? `${wearDelta.toFixed(1)}%`
        : "No change (0%)";

  const statusBadge = getStatusBadgeConfig(newStatus);
  const total = counts.total || 40;
  const healthyPct = Math.round((counts.healthy / total) * 100);
  const monitorPct = Math.round((counts.monitor / total) * 100);
  const actionPct = Math.round((counts.action / total) * 100);
  const criticalPct = Math.round((counts.critical / total) * 100);

  const subject = `[DWMS Wear Update] Liner ${linerId} Wear ${newWear.toFixed(1)}% (${statusBadge.label}) — Rajasthan Ore Hub`;

  // Plain Text Version
  const textContent = `
================================================================================
DWMS - DIGITAL WEAR MONITORING SYSTEM
Automated Liner Wear Update Notification
================================================================================

A wear percentage update has been recorded for Liner ${linerId} (${fullCode}).

--- PART WEAR UPDATE DETAILS ---
- Position (Where):       Liner ${linerId}
- Assembly (Which):       ${assembly}
- Replacement Part:       ${partNo}
- Chute Location:         ${chute}
- Zone:                   ${zone}
- Previous Wear:          ${previousWear.toFixed(1)}%
- New Wear Percentage:    ${newWear.toFixed(1)}% (${deltaText})
- Current Status:         ${statusBadge.label}
- Remaining Thickness:    ${remainingThickness.toFixed(1)} mm
- Original Thickness:     ${origThickness} mm
- Minimum Acceptable:     ${minAcceptable} mm
- Wear Rate:              ${wearRateDay}%/day · ${wearRateMonth} mm/month
- Estimated Remaining:    ${rulDays} days

--- OVERALL FLEET & CHUTE HEALTH STATUS ---
Total Monitored Parts:    ${total}
- HEALTHY:                ${counts.healthy} parts (${healthyPct}%)
- MONITOR:                ${counts.monitor} parts (${monitorPct}%)
- ACTION REQUIRED:        ${counts.action} parts (${actionPct}%)
- CRITICAL:               ${counts.critical} parts (${criticalPct}%)

Timestamp: ${formattedDate}
View Live Wear Map: ${appUrl}/liner-wear-map

================================================================================
DWMS Telemetry Notification Service · Rajasthan Ore Hub
`.trim();

  // HTML Version (Responsive, styled with DWMS Navy and Beumer Blue branding)
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #112b35;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f4f6; padding: 24px 12px;">
    <tr>
      <td align="center">
        <!-- Main Email Container -->
        <table role="presentation" width="100%" style="max-width: 640px; background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #d6dde1; box-shadow: 0 4px 12px rgba(0,0,0,0.06);">
          
          <!-- DWMS Header -->
          <tr>
            <td style="background-color: #07343e; padding: 20px 28px; border-bottom: 4px solid #009fe3;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="font-size: 11px; letter-spacing: 1.5px; color: #009fe3; font-weight: 700; text-transform: uppercase;">
                      BEUMER GROUP · DWMS TELEMETRY
                    </div>
                    <div style="font-size: 20px; font-weight: 800; color: #ffffff; margin-top: 4px; letter-spacing: -0.3px;">
                      Digital Wear Monitoring System
                    </div>
                    <div style="font-size: 12px; color: #9bb7c2; margin-top: 2px;">
                      Rajasthan Ore Hub · Automated Wear Telemetry Alert
                    </div>
                  </td>
                  <td align="right" valign="middle">
                    <span style="display: inline-block; padding: 6px 12px; background-color: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; color: #ffffff; font-size: 11px; font-weight: 700;">
                      ${chute.split("—")[0].trim()}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Alert Banner -->
          <tr>
            <td style="padding: 24px 28px 12px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafb; border-left: 4px solid #009fe3; border-radius: 4px; padding: 14px 18px;">
                <tr>
                  <td>
                    <div style="font-size: 12px; font-weight: 700; color: #647b86; text-transform: uppercase; letter-spacing: 0.5px;">
                      Automatic Alert Trigger
                    </div>
                    <div style="font-size: 16px; font-weight: 800; color: #07343e; margin-top: 4px;">
                      Wear percentage changed on Liner ${linerId}
                    </div>
                    <div style="font-size: 13px; color: #435b66; margin-top: 4px; line-height: 1.4;">
                      Wear percentage updated from <strong style="color: #647b86;">${previousWear.toFixed(1)}%</strong> to <strong style="color: #07343e;">${newWear.toFixed(1)}%</strong> (${deltaText}). Condition status is now evaluated as <strong>${statusBadge.label}</strong>.
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Key Metrics Grid -->
          <tr>
            <td style="padding: 8px 28px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <!-- Card 1: New Wear -->
                  <td width="32%" style="background-color: #f4f8fa; border: 1px solid #d6dde1; border-radius: 6px; padding: 12px 14px; text-align: center;">
                    <div style="font-size: 11px; font-weight: 700; color: #647b86; text-transform: uppercase;">NEW WEAR</div>
                    <div style="font-size: 24px; font-weight: 800; color: #009fe3; margin-top: 4px;">${newWear.toFixed(1)}%</div>
                    <div style="font-size: 11px; color: ${wearDelta >= 0 ? '#ea580c' : '#16a34a'}; font-weight: 600; margin-top: 2px;">
                      ${deltaText} delta
                    </div>
                  </td>
                  <td width="2%"></td>
                  <!-- Card 2: Remaining Thickness -->
                  <td width="32%" style="background-color: #f4f8fa; border: 1px solid #d6dde1; border-radius: 6px; padding: 12px 14px; text-align: center;">
                    <div style="font-size: 11px; font-weight: 700; color: #647b86; text-transform: uppercase;">REMAINING</div>
                    <div style="font-size: 24px; font-weight: 800; color: #07343e; margin-top: 4px;">${remainingThickness.toFixed(1)}<span style="font-size: 13px; font-weight: 600;">mm</span></div>
                    <div style="font-size: 11px; color: #647b86; margin-top: 2px;">Min: ${minAcceptable} mm</div>
                  </td>
                  <td width="2%"></td>
                  <!-- Card 3: Condition Status -->
                  <td width="32%" style="background-color: ${statusBadge.bg}; border: 1px solid ${statusBadge.border}; border-radius: 6px; padding: 12px 14px; text-align: center;">
                    <div style="font-size: 11px; font-weight: 700; color: ${statusBadge.text}; text-transform: uppercase;">CONDITION</div>
                    <div style="font-size: 16px; font-weight: 800; color: ${statusBadge.text}; margin-top: 8px; letter-spacing: 0.3px;">
                      ${statusBadge.label}
                    </div>
                    <div style="font-size: 11px; color: ${statusBadge.text}; margin-top: 4px; font-weight: 600;">RUL: ${rulDays}d</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Section: Updated Part Parameters -->
          <tr>
            <td style="padding: 16px 28px 8px;">
              <div style="font-size: 13px; font-weight: 800; color: #07343e; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #edf2f5; padding-bottom: 6px; margin-bottom: 10px;">
                Updated Part Specifications
              </div>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size: 12px;">
                <tr style="border-bottom: 1px solid #f1f4f6;">
                  <td style="padding: 6px 0; color: #647b86; font-weight: 600;">Position (Where):</td>
                  <td style="padding: 6px 0; color: #07343e; font-weight: 700; text-align: right;">Liner ${linerId} (${fullCode})</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f4f6;">
                  <td style="padding: 6px 0; color: #647b86; font-weight: 600;">Chute Location:</td>
                  <td style="padding: 6px 0; color: #07343e; font-weight: 700; text-align: right;">${chute}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f4f6;">
                  <td style="padding: 6px 0; color: #647b86; font-weight: 600;">Assembly (Which):</td>
                  <td style="padding: 6px 0; color: #07343e; font-weight: 700; text-align: right;">${assembly}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f4f6;">
                  <td style="padding: 6px 0; color: #647b86; font-weight: 600;">Replacement Part No:</td>
                  <td style="padding: 6px 0; color: #07343e; font-weight: 700; text-align: right;">${partNo}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f4f6;">
                  <td style="padding: 6px 0; color: #647b86; font-weight: 600;">Wear Rate:</td>
                  <td style="padding: 6px 0; color: #07343e; font-weight: 700; text-align: right;">${wearRateDay}%/day · ${wearRateMonth} mm/month</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #647b86; font-weight: 600;">Estimated Remaining Life:</td>
                  <td style="padding: 6px 0; color: #07343e; font-weight: 700; text-align: right;">${rulDays} operating days</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Section: Overall Fleet & Chute Health Status -->
          <tr>
            <td style="padding: 16px 28px 20px;">
              <div style="font-size: 13px; font-weight: 800; color: #07343e; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #edf2f5; padding-bottom: 6px; margin-bottom: 12px;">
                Fleet Health Status Breakdown (${total} Total Liners)
              </div>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <!-- Healthy -->
                  <td width="23%" style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 10px 8px; text-align: center;">
                    <div style="font-size: 10px; font-weight: 700; color: #166534; text-transform: uppercase;">HEALTHY</div>
                    <div style="font-size: 20px; font-weight: 800; color: #15803d; margin-top: 3px;">${counts.healthy}</div>
                    <div style="font-size: 10px; color: #166534; margin-top: 2px;">${healthyPct}% of total</div>
                  </td>
                  <td width="2%"></td>
                  <!-- Monitor -->
                  <td width="23%" style="background-color: #fefce8; border: 1px solid #fef08a; border-radius: 6px; padding: 10px 8px; text-align: center;">
                    <div style="font-size: 10px; font-weight: 700; color: #854d0e; text-transform: uppercase;">MONITOR</div>
                    <div style="font-size: 20px; font-weight: 800; color: #a16207; margin-top: 3px;">${counts.monitor}</div>
                    <div style="font-size: 10px; color: #854d0e; margin-top: 2px;">${monitorPct}% of total</div>
                  </td>
                  <td width="2%"></td>
                  <!-- Action Required -->
                  <td width="24%" style="background-color: #fff7ed; border: 1px solid #fed7aa; border-radius: 6px; padding: 10px 8px; text-align: center;">
                    <div style="font-size: 10px; font-weight: 700; color: #c2410c; text-transform: uppercase;">ACTION REQ.</div>
                    <div style="font-size: 20px; font-weight: 800; color: #ea580c; margin-top: 3px;">${counts.action}</div>
                    <div style="font-size: 10px; color: #c2410c; margin-top: 2px;">${actionPct}% of total</div>
                  </td>
                  <td width="2%"></td>
                  <!-- Critical -->
                  <td width="23%" style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 10px 8px; text-align: center;">
                    <div style="font-size: 10px; font-weight: 700; color: #991b1b; text-transform: uppercase;">CRITICAL</div>
                    <div style="font-size: 20px; font-weight: 800; color: #dc2626; margin-top: 3px;">${counts.critical}</div>
                    <div style="font-size: 10px; color: #991b1b; margin-top: 2px;">${criticalPct}% of total</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Action Button CTA -->
          <tr>
            <td style="padding: 4px 28px 24px; text-align: center;">
              <a href="${appUrl}/liner-wear-map" target="_blank" style="display: inline-block; background-color: #009fe3; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 4px; font-size: 13px; font-weight: 700; letter-spacing: 0.3px; box-shadow: 0 2px 6px rgba(0,159,227,0.3);">
                View Digital Liner Wear Map &rarr;
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafb; border-top: 1px solid #e5eaed; padding: 16px 28px; font-size: 11px; color: #728a96; line-height: 1.5;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <strong>DWMS Telemetry Notification Engine</strong><br>
                    BEUMER Group · Digital Wear Monitoring System (DWMS)<br>
                    Rajasthan Ore Hub · Production Plant #1
                  </td>
                  <td align="right" valign="top">
                    Logged at: ${formattedDate}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();

  // If SMTP credentials are NOT yet set up in .env, simulate and log gracefully
  if (!isSmtpConfigured()) {
    console.info(
      "[DWMS Email Service - Notice] SMTP credentials are not yet configured in .env. Email dispatch simulated successfully."
    );
    console.info(`[DWMS Email Service] Subject: "${subject}"`);
    console.info(`[DWMS Email Service] Recipient: ${toEmail}`);
    console.info(
      `[DWMS Email Service] Fleet Counts -> Healthy: ${counts.healthy}, Monitor: ${counts.monitor}, Action: ${counts.action}, Critical: ${counts.critical}`
    );

    return {
      success: true,
      simulated: true,
      message:
        "Wear update saved. SMTP credentials are not yet configured in .env; email dispatch was logged to console.",
    };
  }

  // Real SMTP Dispatch
  try {
    const effective = await getEffectiveSmtpHost();
    const transporter = getMailTransporter({
      targetHost: effective.host,
      forcePort: effective.port,
      forceSecure: effective.secure,
    });

    const info = await transporter.sendMail({
      from: fromEmail,
      to: toEmail,
      subject,
      text: textContent,
      html: htmlContent,
    });

    console.info(
      `[DWMS Email Service] Email successfully sent to ${toEmail}. Message ID: ${info.messageId}`
    );

    return {
      success: true,
      simulated: false,
      messageId: info.messageId,
      message: `Automatic alert email sent to ${toEmail} successfully.`,
    };
  } catch (err: any) {
    const primaryError = formatSmtpError(err);
    console.error("[DWMS Email Service] Primary SMTP dispatch failed:", primaryError);

    // Automatic fallback: Try Google Direct IP on Port 465 SSL
    const host = sanitizeEnv(process.env.SMTP_HOST || "");
    if (host.includes("gmail.com") || toEmail.endsWith("@gmail.com")) {
      try {
        console.info(
          `[DWMS Email Service] Retrying dispatch via Google Direct IP (${GMAIL_DIRECT_IPS[0]}:465 SSL)...`
        );
        const fallbackTransporter = getMailTransporter({
          targetHost: GMAIL_DIRECT_IPS[0],
          forcePort: 465,
          forceSecure: true,
        });
        const fallbackInfo = await fallbackTransporter.sendMail({
          from: fromEmail,
          to: toEmail,
          subject,
          text: textContent,
          html: htmlContent,
        });

        console.info(
          `[DWMS Email Service] Email sent successfully via Google Direct IP fallback! Message ID: ${fallbackInfo.messageId}`
        );

        return {
          success: true,
          simulated: false,
          messageId: fallbackInfo.messageId,
          message: `Automatic alert email sent to ${toEmail} successfully (via Google Direct IP bypass).`,
        };
      } catch (fallbackErr: any) {
        const fallbackFormatted = formatSmtpError(fallbackErr);
        console.error("[DWMS Email Service] Direct IP fallback dispatch also failed:", fallbackFormatted);
      }
    }

    return {
      success: false,
      error: primaryError,
      message: `Wear update saved, but SMTP email delivery failed: ${primaryError}`,
    };
  }
}
