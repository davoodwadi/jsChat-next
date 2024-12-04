import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import type { Provider } from "next-auth/providers"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import client from "@/lib/db"

const providers: Provider[] = [
  Google({
    clientId: process.env.AUTH_GOOGLE_ID,
    clientSecret: process.env.AUTH_GOOGLE_SECRET,
    async profile(profile) {
      console.log("profile:", profile)
      return { ...profile }
    },
  }),
  GitHub({
    clientId: process.env.AUTH_GITHUB_ID,
    clientSecret: process.env.AUTH_GITHUB_SECRET,
  }),
]
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: providers,
  adapter: MongoDBAdapter(client, { databaseName: "next" }),
})
