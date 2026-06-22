import { prisma } from "@/lib/prisma";
import {
  getLondonDateString,
  getMidnightLondonExpiry,
  MFA_COOKIE_NAME,
  mfaCookieOptions,
  parseMfaCookie,
  secondsUntilMidnightLondon,
  signMfaCookie,
} from "@/lib/daily-mfa";
import { NextRequest, NextResponse } from "next/server";
import {
  generateOtpCode,
  getOtpExpiry,
  hashOtpCode,
  verifyOtpCode,
} from "@/lib/mfa-otp";

export const OTP_RESEND_COOLDOWN_SEC = 120;

export async function getOtpResendIn(userId: string): Promise<number> {
  const session = await prisma.customerMfaSession.findUnique({
    where: { userId },
    select: { lastOtpSentAt: true },
  });
  if (!session?.lastOtpSentAt) return 0;
  const elapsedSec = (Date.now() - session.lastOtpSentAt.getTime()) / 1000;
  return Math.max(0, Math.ceil(OTP_RESEND_COOLDOWN_SEC - elapsedSec));
}

export async function storePendingOtp(userId: string, code: string) {
  const today = getLondonDateString();
  const expiresAt = getMidnightLondonExpiry();
  const otpExpiresAt = getOtpExpiry();
  const otpHash = hashOtpCode(userId, code);

  await prisma.customerMfaSession.upsert({
    where: { userId },
    create: {
      userId,
      validDate: today,
      expiresAt,
      lastOtpSentAt: new Date(),
      otpHash,
      otpExpiresAt,
    },
    update: {
      lastOtpSentAt: new Date(),
      otpHash,
      otpExpiresAt,
    },
  });
}

export async function verifyPendingOtp(userId: string, code: string): Promise<boolean> {
  const session = await prisma.customerMfaSession.findUnique({ where: { userId } });
  if (!session?.otpHash || !session.otpExpiresAt) return false;
  if (session.otpExpiresAt < new Date()) return false;
  return verifyOtpCode(userId, code, session.otpHash);
}

export async function clearPendingOtp(userId: string) {
  await prisma.customerMfaSession.updateMany({
    where: { userId },
    data: { otpHash: null, otpExpiresAt: null },
  });
}

export async function isDailyMfaVerified(userId: string, req: NextRequest): Promise<boolean> {
  const cookieValue = req.cookies.get(MFA_COOKIE_NAME)?.value;
  const fromCookie = parseMfaCookie(cookieValue);
  if (fromCookie?.userId === userId) return true;

  const today = getLondonDateString();
  const session = await prisma.customerMfaSession.findUnique({ where: { userId } });
  if (!session) return false;
  if (session.validDate !== today) return false;
  if (session.expiresAt < new Date()) return false;
  return true;
}

export async function recordDailyMfaVerification(userId: string): Promise<{
  cookieValue: string;
  maxAge: number;
  expiresAt: Date;
}> {
  const today = getLondonDateString();
  const maxAge = secondsUntilMidnightLondon();
  const expiresAt = getMidnightLondonExpiry();

  await prisma.customerMfaSession.upsert({
    where: { userId },
    create: { userId, validDate: today, expiresAt },
    update: {
      validDate: today,
      expiresAt,
      otpHash: null,
      otpExpiresAt: null,
    },
  });

  return {
    cookieValue: signMfaCookie(userId, today),
    maxAge,
    expiresAt,
  };
}

export function attachMfaCookie(res: NextResponse, cookieValue: string, maxAge: number) {
  res.cookies.set(MFA_COOKIE_NAME, cookieValue, mfaCookieOptions(maxAge));
}

export function clearMfaCookie(res: NextResponse) {
  res.cookies.set(MFA_COOKIE_NAME, "", { ...mfaCookieOptions(0), maxAge: 0 });
}

export async function clearDailyMfaVerification(userId: string) {
  await prisma.customerMfaSession.deleteMany({ where: { userId } });
}
