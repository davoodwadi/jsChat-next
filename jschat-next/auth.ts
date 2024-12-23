import NextAuth, { Profile } from "next-auth";
import { authConfig } from "./auth.config";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { connectToDatabase } from "@/lib/db";
// type Provider = "google" | "github";

type Doc = {
  username: string | null | undefined;
  email: string | null | undefined;
  photo: string | null | undefined;
  tokensConsumed: number;
  tokensRemaining: number;
  maxTokensPerMonth: number;
  createdAt: Date;
  quotaRefreshedAt: Date;
  lastLogin: Date;
  googleInfo?: Profile;
  githubInfo?: Profile;
} | null;
function getDoc({ profile, provider }: { profile: Profile; provider: string }) {
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
  };
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
};
export async function createOrUpdateUser({
  profile,
  provider,
}: {
  profile: Profile;
  provider: string;
}) {
  const email = profile.email;
  const client = await connectToDatabase();
  if (!client) {
    new Error("Database connection failed");
    return {};
  }
  const plansCollection = client.db("chat").collection("plans");
  const plansUser = await plansCollection.findOne(
    { username: email },
    {
      projection: essentialProjection,
    }
  );
  // check if exists in plans collection
  let doc = null;
  if (!plansUser) {
    // user not found in plans collection -> create it
    doc = getDoc({ profile: profile, provider: provider });
    const res = await plansCollection.insertOne(doc);
    console.log("user added", res);
  } else {
    // user exists
    console.log("user found in plans collection");
    doc = plansUser;
  }
  let userInfo;
  let toReturn;
  userInfo = doc;
  toReturn = {
    username: userInfo.email,
    email: userInfo.email,
    photo: userInfo.photo,
    tokensConsumed: userInfo.tokensConsumed,
    tokensRemaining: userInfo.tokensRemaining,
    maxTokensPerMonth: userInfo.maxTokensPerMonth,
    createdAt: userInfo.createdAt,
    quotaRefreshedAt: userInfo.quotaRefreshedAt,
    lastLogin: userInfo.lastLogin,
  };

  return toReturn;
}

const client = await connectToDatabase();
let adapter;
if (client) {
  adapter = MongoDBAdapter(client, { databaseName: "next" });
} else {
  adapter = undefined;
}
export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: adapter,

  session: { strategy: "jwt" }, // force JWT session with a database
  callbacks: {
    async signIn({ account, profile }) {
      if (account && profile) {
        console.log("signed in with provoider: ", account.provider);

        await createOrUpdateUser({
          profile: profile,
          provider: account.provider,
        });
        return true;
      } else {
        return false;
      }
    },
  },
});
