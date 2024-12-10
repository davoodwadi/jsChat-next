"use client";

// import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { SuccessCardContent, UserCurrentTokens } from "./ServerComponents";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLeftLong } from "@fortawesome/free-solid-svg-icons";
// import { UserCurrentTokens, PaymentStatus } from "./ServerComponents";

export function SuccessCardClient() {
  const [data, setData] = useState();
  const searchParams = useSearchParams();
  const session_id = searchParams.get("session_id");
  let status = null;
  let description;
  let tokens;
  let email;
  console.log("session_id", session_id);

  useEffect(() => {
    async function fetchData() {
      const response = await fetch(
        `/api/stripe/check-payment-status?session_id=${session_id}`
      );

      const dataJson = await response.json();
      setData(dataJson);
      if (dataJson?.message === "pending") {
        console.log("checking payment status again in 3s");
        setTimeout(fetchData, 3000); // Check every 3 seconds
      }
    }
    if (session_id) {
      fetchData();
    }
  }, [session_id]);

  console.log("data", data);
  if (data?.message === "pending") {
    status = "Verifying Transaction";

    tokens = data.newTokens;
    email = data.email;
  } else if (data?.message === "success") {
    status = "Transaction Successful";
    description = session_id;
    tokens = data.newTokens;
    email = data.email;
  } else if (data?.message === "expired") {
    status = "Transaction Already Verified";
    description = session_id;
    tokens = data.newTokens;
    email = data.email;
  } else if (data?.error) {
    status = "Error Fetching Transaction";
  }
  return (
    <>
      <Card className="mx-auto my-auto break-words  w-1/2">
        <CardHeader className="text-center">
          <CardTitle>Status</CardTitle>
          <CardDescription>
            {/* <p> */}
            {status ? status : <Skeleton className="h-4 w-1/2 mx-auto" />}
            {/* </p> */}
          </CardDescription>
        </CardHeader>
        {/* <CardContent className="text-center">
          <p>Transaction details</p>
          <CardDescription className="">
            {description ? (
              description
            ) : (
              <Skeleton className="h-4 w-[250px] mx-auto" />
            )}
          </CardDescription>
        </CardContent> */}
        <CardContent className="text-center">
          <p>Account information</p>

          <CardDescription className="m-2 mx-auto">
            <p>Account</p>
            {tokens ? email : <Skeleton className="h-4 w-5/6 mx-auto" />}
          </CardDescription>
          <CardDescription className="m-2 mx-auto">
            <p>Tokens remaining</p>
            {tokens ? tokens : <Skeleton className="h-4 w-2/3 mx-auto" />}
          </CardDescription>
          <CardDescription className="m-2 mt-6 mx-auto">
            <Link href="/">
              <FontAwesomeIcon icon={faLeftLong} className="mx-2" /> Go Back To
              Chat
            </Link>
          </CardDescription>
        </CardContent>
      </Card>
    </>
  );
}
