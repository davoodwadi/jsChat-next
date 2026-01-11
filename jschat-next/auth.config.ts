import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import type { Provider } from "next-auth/providers";

const providers: Provider[] = [
  Google({
    clientId: process.env.AUTH_GOOGLE_ID,
    clientSecret: process.env.AUTH_GOOGLE_SECRET,
    allowDangerousEmailAccountLinking: true,
    async profile(profile) {
      // console.log("profile:", profile);

      return { email: profile.email };
    },
  }),
  GitHub({
    id: "github-chat",
    clientId: process.env.AUTH_GITHUB_ID,
    clientSecret: process.env.AUTH_GITHUB_SECRET,
    allowDangerousEmailAccountLinking: true,
    async profile(profile) {
      // console.log("profile:", profile)

      return { email: profile.email };
    },
  }),
  GitHub({
    id: "github-dev", // Custom ID
    name: "GitHub",
    clientId: process.env.AUTH_GITHUB_ID_DEV,
    clientSecret: process.env.AUTH_GITHUB_SECRET_DEV,
    allowDangerousEmailAccountLinking: true,
    async profile(profile) {
      return { email: profile.email };
    },
  }),
  GitHub({
    id: "github-local",
    name: "GitHub",
    clientId: process.env.AUTH_GITHUB_ID_LOCAL,
    clientSecret: process.env.AUTH_GITHUB_SECRET_LOCAL,
    allowDangerousEmailAccountLinking: true,
    async profile(profile) {
      return { email: profile.email };
    },
  }),
];

export const providerMap = providers
  .map((provider) => {
    if (typeof provider === "function") {
      const providerData = provider();
      return { id: providerData.id, name: providerData.name };
    } else {
      // console.log("provider in auth.config", provider);
      return provider;
      // return { id: provider.id, name: provider.name };
    }
  })
  .filter((provider) => provider.id !== "credentials");
export const authConfig = {
  providers: providers,
};
// console.log("authConfig", authConfig);
