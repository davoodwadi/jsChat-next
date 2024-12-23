"use client";
import { useState } from "react";
export function DummyClient() {
  const [value, setValue] = useState();
  return (
    <>
      <input
        onChange={(e) => {
          setValue(e.target.value);
        }}
      />
      <h1>{value}</h1>
    </>
  );
}
