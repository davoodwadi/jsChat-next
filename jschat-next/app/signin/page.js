// "use server";

import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import { providerMap } from "@/auth.config";
import Image from "next/image";
import { AuthError } from "next-auth";

export default async function SignInPage(props) {
  // console.log("providerMap", providerMap);
  // const sp = await props.searchParams;
  // console.log(
  //   "props.searchParams?.callbackUrl",
  //   props.searchParams?.callbackUrl
  // );
  return (
    <div className="flex flex-col gap-2">
      {Object.values(providerMap).map((provider, i) => (
        <form
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
                return redirect(`${SIGNIN_ERROR_URL}?error=${error.type}`);
              }

              // Otherwise if a redirects happens Next.js can handle it
              // so you can just re-thrown the error and let Next.js handle it.
              // Docs:
              // https://nextjs.org/docs/app/api-reference/functions/redirect#server-component
              throw error;
            }
          }}
        >
          <button type="submit">
            <span>
              Sign in with {provider.name}
              <Image
                src="https://authjs.dev/img/providers/github.svg"
                alt="GitHub Logo"
                width={20} // Set the desired width
                height={20} // Set the desired height
                style={{ marginLeft: "8px" }} // Add some space between the text and the logo
              />
            </span>
          </button>
        </form>
      ))}
    </div>
  );
}
