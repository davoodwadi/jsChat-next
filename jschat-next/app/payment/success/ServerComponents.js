import {
  getTokens,
  getStatus,
} from "@/app/api/stripe/check-payment-status/actions";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";
import { SuccessCardClient } from "./ClientComponent";

export async function UserCurrentTokens() {
  const currentTokens = await getTokens();
  return (
    <>
      <p>Tokens remaining: {currentTokens}</p>
      <SuccessCardClient />
    </>
  );
}

export async function PaymentStatus({ session_id }) {
  const status = await getStatus({ session_id: session_id, retries: 0 });
  return <p>{status}</p>;
}

export function SuccessCardContent({ session_id }) {
  return (
    <>
      <CardHeader className="text-center">
        <CardTitle>Status</CardTitle>
        <CardDescription>
          <Suspense fallback={<Skeleton className="h-4 w-[200px] mx-auto" />}>
            <PaymentStatus session_id={session_id} />
          </Suspense>
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <p>Transaction details</p>
        <CardDescription className="">
          <div className="space-y-2 mx-auto">
            <Skeleton className="h-4 w-[250px] mx-auto" />
          </div>
        </CardDescription>
      </CardContent>
      <CardContent className="text-center">
        <p>Account information</p>

        <CardDescription className="">
          <div className="space-y-2 mx-auto">
            <Suspense fallback={<Skeleton className="h-4 w-[250px] mx-auto" />}>
              <UserCurrentTokens />
            </Suspense>
          </div>
        </CardDescription>
      </CardContent>
    </>
  );
}
