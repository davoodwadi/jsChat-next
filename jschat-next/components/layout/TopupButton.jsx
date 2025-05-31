"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TopupButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  return (
    <Button
      className="mx-1"
      onClick={() => {
        setLoading(true);
        router.push("/topup");
        setLoading(false);
      }}
      disabled={loading}
    >
      Topup
    </Button>
  );
}
