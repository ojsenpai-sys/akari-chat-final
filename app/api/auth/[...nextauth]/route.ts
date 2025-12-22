// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth"; // 手順2で作った設定を読み込み

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };