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

export default async function Page({ searchParams }) {
  const filters = await searchParams;
  console.log("filters", filters);
  console.log("typeof session_id", typeof filters.session_id);
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
          Session ID: {filters.session_id}
        </CardDescription>
      </CardContent>
      <CardContent className="text-center">
        <p>Account information</p>
        <CardDescription className="">
          <Suspense fallback={<Skeleton className="h-4 w-[250px] mx-auto" />}>
            <UserCurrentTokens />
          </Suspense>
        </CardDescription>
      </CardContent>
    </Card>
  );
}

async function UserCurrentTokens() {
  const currentTokens = await getTokens();
  return <p>Tokens remaining: {currentTokens}</p>;
}
