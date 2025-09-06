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
import { sendPaymentEmail } from "@/components/email/emailAction";
import { expireSession } from "@/lib/payment/paymentActions";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const filters = await searchParams;
  const session_id = filters?.session_id;
  // console.log("Page session_id", session_id);
  // expire the session
  const expired = await expireSession(session_id);
  console.log("session status", expired);
  //
  // send email
  const info = await getTokens(session_id);
  // console.log("info", info);
  if (info.emailSent === false) {
    console.log("fresh failed payment. sending email.");
    sendPaymentEmail({
      status: "failure",
      sessionId: session_id,
      tokensRemaining: info.tokens,
      email: info.email,
      date: info.date,
      time: info.time,
      amount: info.amount,
      currency: info.currency,
    });
  } else {
    console.log("duplicate failed payment.", info.emailSent);
  }
  //
  // console.log("filters", typeof filters);
  // console.log("typeof session_id", typeof filters.session_id);
  return (
    <Card className="mx-auto my-auto break-words  w-1/2">
      {/* // w-36 xs:w-64 md:w-80 */}
      <CardHeader className="text-center">
        <CardTitle>Status</CardTitle>
        <CardDescription>Payment failed</CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <p>Transaction details</p>
        <CardDescription className="">
          <p>Transaction ID</p>
          <Suspense fallback={<Skeleton className="h-4 w-5/6 mx-auto" />}>
            <p>{filters.session_id}</p>
          </Suspense>
        </CardDescription>
      </CardContent>
      <CardContent className="text-center">
        <p>Account information</p>
        <CardDescription className="">
          <p>Credits remaining</p>
          <Suspense fallback={<Skeleton className="h-4 w-1/2 mx-auto" />}>
            <p>{getCreditsOnly(session_id)}</p>
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

async function getTokensOnly(session_id: any) {
  const info = await getTokens(session_id);
  return info?.tokens;
}
async function getCreditsOnly(session_id: any) {
  const tokens = await getTokensOnly(session_id);
  return tokens ? tokens / 1000 : null;
}
