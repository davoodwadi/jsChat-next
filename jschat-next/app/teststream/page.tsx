"use client";

import { handleTestDummy } from "@/lib/chatUtils";
import { useState } from "react";
export default function Page() {
  const [text, setText] = useState("");

  return (
    <>
      <button
        onClick={() => {
          handleTestDummy(setText);
        }}
      >
        generate
      </button>
      <div>{text}</div>
    </>
  );
}
