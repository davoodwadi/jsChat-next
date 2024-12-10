"use client";

import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Loader2 } from "lucide-react";

type props = {
  priceId: string;
  price: string;
  description: string;
};
export default function PaymentComponent({
  priceId,
  price,
  description,
  ...rest
}: props) {
  const [loading, setLoading] = useState(false);
  // console.log("...rest", rest);
  const handleSubmit = async () => {
    setLoading(true);
    const stripe = await loadStripe(
      process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY as string
    );
    if (!stripe) {
      console.error("Could not load stripe.");
      return;
    }
    try {
      const response = await axios.post("/api/stripe/checkout", {
        priceId: priceId,
      });
      const data = response.data;
      // console.log("data", data)
      if (!data.ok) throw new Error("Something went wrong");
      await stripe.redirectToCheckout({
        sessionId: data.result.id,
      });
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Button
      className={rest.className}
      onClick={handleSubmit}
      disabled={loading}
    >
      {loading ? (
        <>
          <Loader2 className="animate-spin" /> {description}
        </>
      ) : (
        description
      )}
    </Button>
  );
}
