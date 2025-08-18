import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      tokensRemaining: number | null;
      chatSessionUserId?: string | null;
    } & DefaultSession["user"];
  }
}
