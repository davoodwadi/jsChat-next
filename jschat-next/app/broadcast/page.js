import { auth } from "@/auth";
import { GetEmailButton } from "./clientside";

export default async function Page() {
  const session = await auth();
  const email = session?.user?.email;
  if (email !== "davood.wadi@hec.ca") {
    return <div>Not Authorized</div>;
  }

  return <GetEmailButton />;
}
