import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { createUserIfMissing, getUserByEmail } from "@/lib/db/repository";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "邮箱登录",
      credentials: {
        email: { label: "邮箱", type: "email" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        if (!email || !email.includes("@")) {
          return null;
        }

        const existing = await getUserByEmail(email);
        const user = existing || (await createUserIfMissing(email));

        return {
          id: user.id,
          email: user.email,
          name: user.name || user.email.split("@")[0],
          plan: user.plan,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) token.id = user.id;
      if (user && "plan" in user && user.plan) token.plan = String(user.plan);
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = String(token.id);
        session.user.plan = String(token.plan || "free");
      }
      return session;
    },
  },
};
