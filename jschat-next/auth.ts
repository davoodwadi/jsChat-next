import NextAuth from "next-auth"
import { authConfig } from "./auth.config"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import { connectToDatabase } from "@/lib/db"
const client = await connectToDatabase()
export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: MongoDBAdapter(client, { databaseName: "next" }),

  session: { strategy: "jwt" }, // force JWT session with a database

  // callbacks: {
  //   authorized: async ({ auth }) => {
  //     // Logged in users are authenticated, otherwise redirect to login page
  //     console.log("inside auth.ts:", auth)
  //     return !!auth
  //   },
  // },
})
