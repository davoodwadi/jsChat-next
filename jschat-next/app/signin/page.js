import { signIn, auth, signOut } from "@/auth"

export default async function SignInPage() {
  const session = await auth()
  console.log("session", session)
  if (!session?.user) {
    return (
      <form
        action={async () => {
          "use server"
          // await signIn("google")
          await signIn()
        }}
      >
        <button type="submit">Signin</button>
      </form>
    )
  } else {
    return (
      <div>
        <form
          action={async () => {
            "use server"
            await signOut()
          }}
        >
          <button type="submit">Sign Out</button>
        </form>
        <img src={session.user.image} alt="User Avatar" />
        <pre>{JSON.stringify(session, null, 2)}</pre>
        <p>email_verified: {session.user.email_verified && "Verified"}</p>
      </div>
    )
  }
}
