import { connectToDatabase } from "@/lib/db";
import { auth } from "@/auth";
import { essentialProjection } from "@/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getTokens } from "@/app/api/stripe/check-payment-status/actions";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLeftLong } from "@fortawesome/free-solid-svg-icons";
import { getSessionTokensLeft } from "@/lib/actions";

export default async function Page() {
  // const session = await auth();
  // console.log("session", session?.user);
  // const client = await connectToDatabase();
  // const plansCollection = client.db("chat").collection("plans");
  // const plansUser = await plansCollection.findOne(
  // { username: session?.user?.email },
  // { projection: essentialProjection }
  // );

  return (
    <Card className="mx-auto my-auto break-words  w-1/2">
      <CardHeader className="text-center">
        <CardTitle>Account information</CardTitle>
        <CardDescription className="">
          <p>Email Address</p>
          <Suspense fallback={<Skeleton className="h-4 w-5/6 mx-auto" />}>
            <p>{getEmail()}</p>
          </Suspense>
        </CardDescription>
      </CardHeader>

      <CardContent className="text-center">
        <p>Tokens remaining</p>
        <CardDescription className="">
          <Suspense fallback={<Skeleton className="h-4 w-1/2 mx-auto" />}>
            <p>{getTokensOnly()}</p>
          </Suspense>
        </CardDescription>
        <CardDescription className="m-2 mt-6 mx-auto">
          <Link href="/">
            <FontAwesomeIcon icon={faLeftLong} className="mx-2" /> Go Back To
            Chat
          </Link>
        </CardDescription>
      </CardContent>
    </Card>
  );
}

async function getEmail() {
  const session = await auth();
  return session?.user?.email;
}

async function getTokensOnly() {
  const { tokensRemaining } = await getSessionTokensLeft();
  return tokensRemaining;
}
