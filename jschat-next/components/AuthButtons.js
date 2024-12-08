import { signOut, signIn, auth } from "@/auth"
import { Button } from "@/components/ui/button"

export async function AuthButton(props) {
  const session = await auth()
  console.log("authenticate session")
  if (session?.user) {
    return (
      <div {...props}>
        <SignOutButton />
      </div>
    )
  } else {
    return (
      <div {...props}>
        <SignInButton />
      </div>
    )
  }
}

export function SignOutButton({ props }) {
  return (
    <form
      className="flex"
      action={async () => {
        "use server"
        // await signIn("google")
        await signOut({ redirectTo: "/" })
      }}
    >
      <Button className="mx-auto" type="submit">
        Sign out
      </Button>
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
        Sign in
      </button>
    </form>
  )
}
