import { auth } from "@/auth";
import { SignButton } from "@/components/AuthButtonsClient";
import { signinAction, signoutAction } from "@/components/authActions";
// import { delay } from "@/lib/myTools";

export default async function AuthButton(props) {
  console.log("authenticate start");

  const session = await auth();
  console.log("authenticate end");
  // await delay(3000);
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
