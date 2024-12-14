// import ChatComponent from "@/components/ChatComponent"
// import RecursiveChat from "@/components/RecursiveComponent";
import { Suspense } from "react";
// import { lazy } from "react";

// const RecursiveChat = lazy(() => import("@/components/RecursiveComponent"));

import dynamic from "next/dynamic";

const RecursiveChat = dynamic(() => import("@/components/RecursiveComponent"), {
  loading: () => <p>Dynamic Loading RecursiveChat...</p>,
});

export default async function Home() {
  console.log("loading RecursiveChat");
  return (
    <>
      <Suspense fallback={<p>Loading RecursiveChat</p>}>
        <RecursiveChat />
      </Suspense>
    </>
  );
}
