import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { logSecurityEvent } from "@/lib/security-event";
import bcrypt from "bcryptjs";

const MAX_ATTEMPTS = 5;
const LOCK_DURATION_MS = 30 * 60 * 1000; // 30 minutes

function extractIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        if (!credentials?.email || !credentials?.password) return null;

        const ip = extractIp(request);
        const userAgent = request.headers.get("user-agent") ?? "unknown";
        const email = credentials.email as string;

        // Rate limit: 10 attempts per email per 15 minutes
        const rl = checkRateLimit({
          key: `auth:${email}`,
          limit: 10,
          windowMs: 15 * 60 * 1000,
        });
        if (!rl.allowed) {
          await logSecurityEvent({ type: "LOGIN_RATE_LIMITED", ip, userAgent, metadata: { email } });
          return null;
        }

        const user = await db.user.findUnique({ where: { email } });

        if (!user) {
          await logSecurityEvent({ type: "LOGIN_FAILURE", ip, userAgent, metadata: { email, reason: "user_not_found" } });
          return null;
        }

        // Account lockout check
        if (user.lockedUntil && user.lockedUntil > new Date()) {
          await logSecurityEvent({ type: "LOGIN_LOCKED", userId: user.id, ip, userAgent });
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );

        if (!isValid) {
          const attempts = user.loginAttempts + 1;
          const shouldLock = attempts >= MAX_ATTEMPTS;
          await db.user.update({
            where: { id: user.id },
            data: {
              loginAttempts: attempts,
              lockedUntil: shouldLock ? new Date(Date.now() + LOCK_DURATION_MS) : null,
            },
          });
          await logSecurityEvent({
            type: shouldLock ? "LOGIN_LOCKED" : "LOGIN_FAILURE",
            userId: user.id,
            ip,
            userAgent,
            metadata: { attempts, locked: shouldLock },
          });
          return null;
        }

        // Successful login — reset lockout counters
        await db.user.update({
          where: { id: user.id },
          data: { loginAttempts: 0, lockedUntil: null },
        });

        await logSecurityEvent({ type: "LOGIN_SUCCESS", userId: user.id, ip, userAgent });

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.avatarUrl,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // Record when this token was issued (seconds → ms for comparison)
        token.issuedAt = Date.now();
      }

      // Check if all sessions have been revoked since this token was issued
      if (token.id) {
        try {
          const dbUser = await db.user.findUnique({
            where: { id: token.id as string },
            select: { sessionRevokedBefore: true },
          });
          if (dbUser?.sessionRevokedBefore) {
            const tokenIssuedMs = (token.issuedAt as number) ?? ((token.iat as number) * 1000);
            if (tokenIssuedMs < dbUser.sessionRevokedBefore.getTime()) {
              return null as never; // Force re-auth
            }
          }
        } catch {
          // Don't block auth on DB error
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
      return session;
    },
  },
});
