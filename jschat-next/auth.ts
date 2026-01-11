import NextAuth, { Profile } from "next-auth";
import { authConfig } from "./auth.config";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { connectToDatabase } from "@/lib/db";
import { addUserToMailingListIfNotExists } from "@/app/broadcast/getEmailsAction";
import { test } from "@/lib/test";
import { headers } from "next/headers";

import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import type { Provider } from "next-auth/providers";

// type Provider = "google" | "github";
export let host = "";

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
  let userId = null; // Store the ObjectId
  if (!plansUser) {
    // user not found in plans collection -> create it
    doc = getDoc({ profile: profile, provider: provider });
    const res = await plansCollection.insertOne(doc);
    console.log("user added", res);

    userId = res.insertedId; // Get ObjectId from insert result
    doc._id = userId; // Add _id to doc object
  } else {
    // user exists
    console.log("user found in plans collection");
    doc = plansUser;
    userId = plansUser._id; // Get ObjectId from existing user
  }
  let userInfo;
  let toReturn;
  userInfo = doc;
  toReturn = {
    chatSessionUserId: userId.toString(), // Add ObjectId as string
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
export const { handlers, signIn, signOut, auth } = NextAuth(async (req) => {
  // 2. Detect the domain from headers
  const headerList = await headers();
  host = headerList.get("host") || "";
  // host = req?.headers?.get("host") || "";
  let gitHubType = "";
  if (host.includes("spreed.dev")) {
    gitHubType = "github-dev";
  } else if (host.includes("spreed.chat")) {
    gitHubType = "github-chat";
  } else if (host.includes("localhost")) {
    gitHubType = "github-local";
  }
  const googleProvider = Google({
    clientId: process.env.AUTH_GOOGLE_ID,
    clientSecret: process.env.AUTH_GOOGLE_SECRET,
    allowDangerousEmailAccountLinking: true,
    async profile(profile) {
      // console.log("profile:", profile);

      return { email: profile.email };
    },
  });
  let gitHubProvider;
  if (gitHubType == "github-chat") {
    gitHubProvider = GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
      allowDangerousEmailAccountLinking: true,
      async profile(profile) {
        // console.log("profile:", profile)

        return { email: profile.email };
      },
    });
  } else if (gitHubType == "github-dev") {
    gitHubProvider = GitHub({
      clientId: process.env.AUTH_GITHUB_ID_DEV,
      clientSecret: process.env.AUTH_GITHUB_SECRET_DEV,
      allowDangerousEmailAccountLinking: true,
      async profile(profile) {
        // console.log("profile:", profile)

        return { email: profile.email };
      },
    });
  } else {
    gitHubProvider = GitHub({
      clientId: process.env.AUTH_GITHUB_ID_LOCAL,
      clientSecret: process.env.AUTH_GITHUB_SECRET_LOCAL,
      allowDangerousEmailAccountLinking: true,
      async profile(profile) {
        // console.log("profile:", profile)

        return { email: profile.email };
      },
    });
  }

  const providers: Provider[] = [googleProvider, gitHubProvider];
  // filter providers
  // const filteredProviders = authConfig.providers.filter((provider) => {
  //   // Providers in Auth.js can be objects or functions that return objects
  //   const p = typeof provider === "function" ? provider() : provider;
  //   return p.id === "google" || p.options?.id === gitHubType;
  // });
  console.log("Current host detected:", host, gitHubType, providers);
  // const isDevDomain = host.includes("spreed.dev");
  // console.log(authConfig);
  return {
    // ...authConfig,
    providers: providers,
    adapter: adapter,
    // debug: test ? true : false,

    session: { strategy: "jwt" }, // force JWT session with a database
    callbacks: {
      async signIn({ user, account, profile, email, credentials }) {
        if (account && profile) {
          console.log("signed in with provoider: ", account.provider);

          const info = await createOrUpdateUser({
            profile: profile,
            provider: account.provider,
          });
          addUserToMailingListIfNotExists({
            profile,
            provider: account.provider,
          });
          // console.log("toReturn info", info);
          profile.chatSessionUserId = info?.chatSessionUserId;
          profile.tokensRemaining = info?.tokensRemaining;
          // console.log("profile signIn callback", profile);
          // console.log("user signIn callback", user);
          // console.log("account signIn callback", account);
          // console.log("profile signIn callback", profile);
          // console.log("email signIn callback", email);
          // console.log("credentials signIn callback", credentials);
          return true;
        } else {
          return false;
        }
      },
      async jwt({ token, user, account, profile, isNewUser }) {
        // console.log("user jwt auth.ts", user);
        // console.log("isNewUser jwt auth.ts", isNewUser);
        // console.log("account jwt auth.ts", account);
        // // console.log("token jwt auth.ts", token);
        // console.log("profile jwt auth.ts", profile);
        // Persist the OAuth access_token to the token right after signin
        if (account) {
          token.accessToken = account.access_token;
          token.picture = profile?.picture;
          token.name = profile?.name;
          token.chatSessionUserId = profile?.chatSessionUserId;
          // console.log("token jwt auth.ts", token);

          token.tokensRemaining = profile?.tokensRemaining;
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
        if (typeof token.chatSessionUserId === "string") {
          session.user.chatSessionUserId = token.chatSessionUserId;
        }
        if (typeof token.tokensRemaining === "number") {
          session.user.tokensRemaining = token.tokensRemaining;
        }
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
  };
});
