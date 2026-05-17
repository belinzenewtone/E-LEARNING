import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import bcrypt from "bcryptjs";

const MAX_ATTEMPTS = 5;
const LOCK_DURATION_MS = 30 * 60 * 1000; // 30 minutes

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Rate limit: 10 attempts per email per 15 minutes (IP-level defence)
        const rl = checkRateLimit({
          key: `auth:${credentials.email}`,
          limit: 10,
          windowMs: 15 * 60 * 1000,
        });
        if (!rl.allowed) return null;

        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user) return null;

        // Account lockout check
        if (user.lockedUntil && user.lockedUntil > new Date()) {
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );

        if (!isValid) {
          const attempts = user.loginAttempts + 1;
          await db.user.update({
            where: { id: user.id },
            data: {
              loginAttempts: attempts,
              lockedUntil: attempts >= MAX_ATTEMPTS
                ? new Date(Date.now() + LOCK_DURATION_MS)
                : null,
            },
          });
          return null;
        }

        // Successful login — reset lockout counters
        await db.user.update({
          where: { id: user.id },
          data: { loginAttempts: 0, lockedUntil: null },
        });

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
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
      return session;
    },
  },
});
