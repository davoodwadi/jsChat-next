"use client";

import axios from "axios";
import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Button } from "@/components/ui/button"; // Assuming you're using shadcn/ui or similar for UI components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { creditPacks } from "@/components/payment/PaymentConfig";
// Initialize Stripe with your publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

export default function TopUpPage() {
  const [loading, setLoading] = useState(false);

  // Function to handle purchase and redirect to Stripe Checkout
  const handlePurchase = async (priceId) => {
    setLoading(true);
    try {
      //   console.log("priceId", priceId);
      const response = await axios.post("/api/stripe/checkout", {
        priceId: priceId,
      });
      const priceInfo = creditPacks.find((v) => v.id === priceId);
      const TOKEN_TO_BE_CREDITED_CLIENT = priceInfo
        ? priceInfo?.credits * 1000
        : 100000;
      console.log("TOKEN_TO_BE_CREDITED_CLIENT", TOKEN_TO_BE_CREDITED_CLIENT);
      const data = response.data;
      if (!data.ok) throw new Error("Something went wrong");
      //   console.log("data", data);
      const sessionId = data?.result?.id;
      const stripe = await stripePromise;
      console.log("sessionId", sessionId);
      // Redirect to Stripe Checkout
      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) {
        console.error("Stripe Checkout error:", error);
        alert("Error redirecting to checkout. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Top Up Credits</h1>
      <p className="text-center text-gray-600 mb-8">
        Purchase credits to use Spreed.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {creditPacks.map((pack) => (
          <Card
            key={pack.id}
            className="shadow-md hover:shadow-lg transition-shadow"
          >
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">
                {pack.credits} Credits
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-xl font-semibold mb-2">
                ${pack.price.toFixed(2)}
              </p>
              <Button
                onClick={() => handlePurchase(pack.id)}
                disabled={loading}
                className="w-full"
              >
                {loading ? "Processing..." : "Buy"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
