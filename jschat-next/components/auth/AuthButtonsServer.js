import { auth } from "@/auth";
import { SignButton } from "@/components/auth/AuthButtonsClient";
import { signinAction, signoutAction } from "@/components/auth/authActions";
import { Loader2, LogOut, LogIn } from "lucide-react";

// import { delay } from "@/lib/myTools";

export default async function AuthButton(props) {
  // console.log("authenticate start");

  const session = await auth();
  // console.log("authenticate end");
  // await delay(3000);
  if (session?.user) {
    return (
      <div {...props}>
        <SignButton
          authFunction={signoutAction}
          authIcon={<LogOut />}
          authText={"Sign Out"}
        />
      </div>
    );
  } else {
    return (
      <div {...props}>
        <SignButton
          authFunction={signinAction}
          authIcon={<LogIn />}
          authText={"Sign In"}
        />
      </div>
    );
  }
}
