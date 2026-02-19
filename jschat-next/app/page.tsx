"use client";

import HeroPage from "./HeroPage";
import { generateChatId } from "@/lib/chatUtils";
// import { redirect } from "next/navigation";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useCallback } from "react";

// import { delay } from "@/lib/myTools";
export default function Home({}: {}) {
  // console.log("loading ChatContainer");
  const router = useRouter();
  const chatId = generateChatId();
  console.log("chatId ", chatId);
  const searchParams = useSearchParams();
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      return params.toString();
    },
    [searchParams],
  );
  // redirect(`/chat/${chatId}`); // redirect throws client side exception

  const queryString =
    `/chat/${chatId}` + "?" + createQueryString("new", "true");
  // console.log("queryString", queryString);
  // useEffect(() => {
  //   router.push(queryString);
  // }, []);

  return (
    <>
      <HeroPage />
    </>
  );
}
