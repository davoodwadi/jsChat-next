import { signOut, signIn, auth } from "@/auth"

export async function AuthButton() {
  const session = await auth()
  console.log("authenticate session")
  if (session?.user) {
    return <SignOutButton />
  } else {
    return <SignInButton />
  }
}

export function SignOutButton() {
  return (
    <form
      className="flex"
      action={async () => {
        "use server"
        // await signIn("google")
        await signOut({ redirectTo: "/" })
      }}
    >
      <button className="mx-auto" type="submit">
        Signout button
      </button>
    </form>
  )
}

export function SignInButton() {
  return (
    <form
      className="flex"
      action={async () => {
        "use server"
        // await signIn("google")
        await signIn({ redirectTo: "/" })
      }}
    >
      <button className="mx-auto" type="submit">
        Signin button
      </button>
    </form>
  )
}
