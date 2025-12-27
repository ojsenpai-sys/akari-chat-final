// @ts-nocheck
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      // ★修正：カレンダーの権限(Scope)を要求し、リフレッシュトークンを取得する設定
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/calendar",
          access_type: "offline",     // これによりリフレッシュトークンがもらえます
          prompt: "consent",          // 毎回同意画面を出して確実にトークンを取得（開発時推奨）
        },
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    // ログイン時にトークンの中身を調整
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
      }
      // ★追加：Googleのアクセストークンなどが届いた場合、JWTに保存
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    // アプリ側でセッション情報を呼び出す時の調整
    async session({ session, token }) {
      if (session.user) {
        // @ts-ignore
        session.user.id = token.id as string;
        // ★追加：API側でトークンが扱いやすいように、セッションにトークンを含める（任意）
        // session.accessToken = token.accessToken; 
      }
      return session;
    },
  },
  debug: process.env.NODE_ENV === "development",
};