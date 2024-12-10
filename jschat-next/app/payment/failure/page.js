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

export default async function Page({ searchParams }) {
  // const filters = await searchParams;
  // console.log("filters", filters);
  // console.log("typeof session_id", typeof filters.session_id);
  // return <div>Payment failed: {filters.session_id}</div>
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
          <p>Session ID</p>{" "}
          <Suspense fallback={<Skeleton className="h-4 w-5/6 mx-auto" />}>
            <p>{searchParams?.session_id}</p>
          </Suspense>
        </CardDescription>
      </CardContent>
      <CardContent className="text-center">
        <p>Account information</p>
        <CardDescription className="">
          {/* <Suspense fallback={<Skeleton className="h-4 w-3/4 mx-auto" />}>
            <UserCurrentTokens />
          </Suspense> */}
          <p>Tokens remaining</p>
          <Suspense fallback={<Skeleton className="h-4 w-1/2 mx-auto" />}>
            <p>{getTokens()}</p>
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

async function UserCurrentTokens() {
  const currentTokens = await getTokens();
  return <p>Tokens remaining: {currentTokens}</p>;
}
