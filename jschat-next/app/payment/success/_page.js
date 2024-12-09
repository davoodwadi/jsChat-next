"use client";
// import { connectToDatabase } from "@/lib/db"

import { use } from "react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SkeletonCard } from "@/components/SkeletonCard";
import { Skeleton } from "@/components/ui/skeleton";

const PaymentSuccess = () => {
  const searchParams = useSearchParams();
  const session_id = searchParams.get("session_id");
  console.log("session_id", session_id);
  const [loading, setLoading] = useState(true);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [tokens, setTokens] = useState(null);
  const [error, setError] = useState(null);
  const [messagePayment, setMessagePayment] = useState(
    "Payment was successful!"
  );
  let data;

  useEffect(() => {
    const checkPaymentStatus = async () => {
      const response = await fetch(
        `/api/stripe/check-payment-status?session_id=${session_id}`
      );

      data = use(response.json());
      if (!response.ok) {
        setLoading(false);
        setError(data.error);
        throw new Error(data.error);
      }
      // console.log("data.message", data.message);

      if (data.message === "success") {
        console.log("setPaymentConfirmed");
        setLoading(false);
        setPaymentConfirmed(true);
        setTokens(data.newTokens);
      } else if (data.message === "expired") {
        console.log("setPaymentDuplicate");
        setLoading(false);
        setPaymentConfirmed(true);
        setTokens(data.newTokens);
        setMessagePayment("Tokens already added!");
      } else {
        // If not confirmed, keep polling
        setLoading(false);
        setTimeout(checkPaymentStatus, 3000); // Check every 3 seconds
      }
    };

    if (session_id) {
      checkPaymentStatus();
    }
  }, [session_id]);

  // if (loading) {
  //   return (
  //     <Suspense>
  //       <CardHeader className="text-center">
  //         <CardTitle>Status</CardTitle>
  //         <CardDescription>
  //           <div>Loading...</div>
  //         </CardDescription>
  //       </CardHeader>
  //       <CardContent className="text-center">
  //         <p>Transaction details</p>
  //         <CardDescription className="">
  //           <Suspense fallback={<Loading />}>{paymentInfo}</Suspense>
  //         </CardDescription>
  //       </CardContent>
  //     </Suspense>
  //   );
  // }

  if (error) {
    return (
      <Suspense>
        <CardHeader className="text-center">
          <CardTitle>Status</CardTitle>
          <CardDescription>
            <div>{error}</div>
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p>Transaction details</p>
          <CardDescription className="">Payment ID:</CardDescription>
        </CardContent>
      </Suspense>
    );
  }

  if (paymentConfirmed) {
    return (
      <Suspense>
        <div>
          <div>{messagePayment}</div>
          <div>Tokens: {tokens}</div>
        </div>
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<Loading />}>
      <CardHeader className="text-center">
        <CardTitle>Status</CardTitle>
        <CardDescription>
          <Suspense>
            <div>Payment is being processed...</div>
          </Suspense>
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <p>Transaction details</p>
        <CardDescription className="">
          <Skeleton className="h-4 w-[250px] mx-auto" />
        </CardDescription>
      </CardContent>
      <CardContent className="text-center">
        <p>Account information</p>
        <Suspense fallback={<Skeleton className="h-4 w-[250px] mx-auto" />}>
          <CardDescription className="">{data}</CardDescription>
        </Suspense>
      </CardContent>
    </Suspense>
  );
};

export default function Page() {
  return (
    <Card className="mx-auto my-auto break-words  w-1/2">
      <Suspense>
        <PaymentSuccess />
      </Suspense>
    </Card>
  );
}

{
  /* 
  <CardHeader className="text-center">
        <CardTitle>Status</CardTitle>
        <CardDescription>
          
          
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <p>Transaction details</p>
        <CardDescription className="">Payment ID:</CardDescription>
      </CardContent>

    */
}

function Loading() {
  return (
    <Suspense>
      <CardHeader className="text-center">
        <CardTitle>Status</CardTitle>
        <CardDescription>
          <Suspense fallback={<Loading />}>
            <div className="space-y-2 mx-auto">
              <Skeleton className="h-4 w-[200px] mx-auto" />
            </div>
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
            <Skeleton className="h-4 w-[250px] mx-auto" />
          </div>
        </CardDescription>
      </CardContent>
    </Suspense>
  );
}
