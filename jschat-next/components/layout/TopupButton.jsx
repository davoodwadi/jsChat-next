"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { WalletCards } from "lucide-react";

export default function TopupButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  return (
    <Button
      className="mx-1  glass-button !rounded-full w-10 h-10 p-0"
      title="Topup"
      onClick={() => {
        setLoading(true);
        router.push("/topup");
        setLoading(false);
      }}
      disabled={loading}
    >
      <WalletCards />
    </Button>
  );
}
