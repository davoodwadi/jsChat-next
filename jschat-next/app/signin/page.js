// "use server";

import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import { getProviders } from "@/auth";
import Image from "next/image";
import { AuthError } from "next-auth";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
export default async function SignInPage(props) {
  // console.log("providerMap", providerMap);
  // const sp = await props.searchParams;
  // console.log(
  //   "props.searchParams?.callbackUrl",
  //   props.searchParams?.callbackUrl
  // );
  const providers = await getProviders();
  // console.log(providers);
  const providerMap = providers
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

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background">
      <Card className="w-[350px] shadow-lg -mt-20">
        <CardHeader className="text-center">
          <CardTitle>Welcome </CardTitle>
          <CardDescription>Sign in to continue to Spreed</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {Object.values(providerMap).map((provider, i) => {
            // console.log("provider", provider);
            const providerSVG = `https://authjs.dev/img/providers/${provider.id}.svg`;
            return (
              <form
                className="w-full"
                key={i}
                action={async () => {
                  "use server";
                  try {
                    await signIn(provider.id, {
                      redirectTo: props.searchParams?.callbackUrl ?? "",
                    });
                  } catch (error) {
                    // Signin can fail for a number of reasons, such as the user
                    // not existing, or the user not having the correct role.
                    // In some cases, you may want to redirect to a custom error
                    if (error instanceof AuthError) {
                      return redirect(
                        `${SIGNIN_ERROR_URL}?error=${error.type}`,
                      );
                    }

                    // Otherwise if a redirects happens Next.js can handle it
                    // so you can just re-thrown the error and let Next.js handle it.
                    // Docs:
                    // https://nextjs.org/docs/app/api-reference/functions/redirect#server-component
                    throw error;
                  }
                }}
              >
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-3 rounded-full bg-secondary px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary/80 h-10"
                >
                  <div className="flex flex-row gap-2">
                    <Image
                      src={providerSVG}
                      alt="GitHub Logo"
                      width={20} // Set the desired width
                      height={20} // Set the desired height
                      style={{ marginLeft: "8px" }} // Add some space between the text and the logo
                    />{" "}
                    Sign in with {provider.name}
                  </div>
                </button>
              </form>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
