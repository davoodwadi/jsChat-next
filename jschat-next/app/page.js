// import ChatComponent from "@/components/ChatComponent"
// import ChatContainer from "@/components/RecursiveComponent";

import { Suspense } from "react";
// import { lazy } from "react";

// const ChatContainer = lazy(() => import("@/components/RecursiveComponent"));

import dynamic from "next/dynamic";

const ChatContainer = dynamic(() => import("@/components/RecursiveComponent"), {
  loading: () => <p>Dynamic Loading ChatContainer...</p>,
});

export default async function Home() {
  // console.log("loading ChatContainer");

  return (
    <>
      <Suspense fallback={<p>Loading ChatContainer</p>}>
        <ChatContainer />
      </Suspense>
    </>
  );
}
