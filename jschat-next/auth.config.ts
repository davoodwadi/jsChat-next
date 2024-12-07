import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import type { Provider } from "next-auth/providers"
import { connectToDatabase } from "@/lib/db"

function getDoc({ profile, provider }) {
  return {
    username: profile.email,
    email: profile.email,
    photo: profile.picture || profile.photo || profile.avatar_url,
    tokensConsumed: 0,
    tokensRemaining: 100000,
    maxTokensPerMonth: 100000,
    createdAt: new Date(),
    quotaRefreshedAt: new Date(),
    lastLogin: new Date(),
    [`${provider}Info`]: profile,
  }
}
export const essentialProjection = {
  email: 1,
  photo: 1,
  tokensRemaining: 1,
  tokensConsumed: 1,
  maxTokensPerMonth: 1,
  quotaRefreshedAt: 1,
  lastLogin: 1,
  createdAt: 1,
}
async function createOrUpdateUser({ profile, provider }) {
  const email = profile.email
  const client = await connectToDatabase()
  const plansCollection = client.db("chat").collection("plans")
  const plansUser = await plansCollection.findOne(
    { username: email },
    {
      projection: essentialProjection,
    }
  )
  // check if exists in plans collection
  let doc
  if (!plansUser) {
    // user not found in plans collection -> create it
    doc = getDoc({ profile: profile, provider: provider })
    const res = await plansCollection.insertOne(doc)
    console.log("user added", res)
  } else {
    // user exists
    console.log("user found in plans collection")
  }
  const userInfo = doc || plansUser
  const toReturn = {
    username: userInfo.email,
    email: userInfo.email,
    photo: userInfo.photo,
    tokensConsumed: userInfo.tokensConsumed,
    tokensRemaining: userInfo.tokensRemaining,
    maxTokensPerMonth: userInfo.maxTokensPerMonth,
    createdAt: userInfo.createdAt,
    quotaRefreshedAt: userInfo.quotaRefreshedAt,
    lastLogin: userInfo.lastLogin,
  }
  return toReturn
}

const providers: Provider[] = [
  Google({
    clientId: process.env.AUTH_GOOGLE_ID,
    clientSecret: process.env.AUTH_GOOGLE_SECRET,
    allowDangerousEmailAccountLinking: true,
    async profile(profile) {
      // console.log("profile:", profile)
      const toReturn = createOrUpdateUser({
        profile: profile,
        provider: "google",
      })
      return toReturn
    },
  }),
  GitHub({
    clientId: process.env.AUTH_GITHUB_ID,
    clientSecret: process.env.AUTH_GITHUB_SECRET,
    allowDangerousEmailAccountLinking: true,
    async profile(profile) {
      // console.log("profile:", profile)
      const toReturn = createOrUpdateUser({
        profile: profile,
        provider: "github",
      })
      return toReturn
    },
  }),
]

export const authConfig = {
  providers: providers,
}
