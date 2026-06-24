import HeroPage from "./HeroPage";
import { getAuth } from "@/lib/actions";
import { redirect } from "next/navigation";

export default async function Home() {
  // 1. Check authentication status on the server
  const authStatus = await getAuth();

  // 2. If the user is logged in (authStatus returns the user email/ID as a string)
  if (typeof authStatus === "string") {
    redirect("/chat");
  }

  // 3. If not logged in, render the landing page
  return (
    <main>
      <HeroPage />
    </main>
  );
}
