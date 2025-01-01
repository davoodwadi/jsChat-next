import NextAuth, { Profile } from "next-auth";
import { authConfig } from "./auth.config";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { connectToDatabase } from "@/lib/db";

console.log();
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
      // console.log("account signIn callback", account);
      if (account && profile) {
        console.log("signed in with provoider: ", account.provider);

        const info = await createOrUpdateUser({
          profile: profile,
          provider: account.provider,
        });
        // console.log("toReturn info", info);
        // profile.tokensRemaining = info.tokensRemaining;
        // console.log("profile signIn callback", profile);

        return true;
      } else {
        return false;
      }
    },
    async jwt({ token, account, profile }) {
      // console.log("account jwt auth.ts", account);
      // console.log("token jwt auth.ts", token);
      // console.log("profile jwt auth.ts", profile);
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
        token.picture = profile?.picture;
        token.name = profile?.name;
        // token.tokensRemaining = profile?.tokensRemaining;
      }
      // console.log("new token jwt auth.ts", token);

      return token;
    },
    async session({ session, token, user }) {
      // console.log("user session auth.ts", user);
      // console.log("token session auth.ts", token);

      // Send properties to the client, like an access_token from a provider.
      // session.accessToken = token.accessToken;
      session.user.image = token.picture;
      session.user.name = token.name;
      // if (
      //   typeof token.tokensRemaining === "number" &&
      //   Number.isFinite(token.tokensRemaining)
      // ) {
      //   session.user.tokensRemaining = token.tokensRemaining;
      // }
      // console.log("session session auth.ts", session);

      return session;
    },
  },
});
