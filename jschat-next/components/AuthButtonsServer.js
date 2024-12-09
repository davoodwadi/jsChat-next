import { auth } from "@/auth";
import { SignButton } from "@/components/AuthButtonsClient";
import { signinAction, signoutAction } from "@/components/authActions";

export async function AuthButton(props) {
  const session = await auth();
  console.log("authenticate session");
  if (session?.user) {
    return (
      <div {...props}>
        <SignButton authFunction={signoutAction} authText="Sign out" />
      </div>
    );
  } else {
    return (
      <div {...props}>
        <SignButton authFunction={signinAction} authText="Sign in" />
      </div>
    );
  }
}
