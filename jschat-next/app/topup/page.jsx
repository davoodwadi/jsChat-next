"use client";

import axios from "axios";
import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Button } from "@/components/ui/button"; // Assuming you're using shadcn/ui or similar for UI components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { creditPacks } from "@/components/payment/PaymentConfig";
import { Sparkles, Zap, Crown, Star } from "lucide-react";

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

export default function TopUpPage() {
  const [loading, setLoading] = useState(false);
  const [loadingPackId, setLoadingPackId] = useState(null);
  // Function to handle purchase and redirect to Stripe Checkout
  const handlePurchase = async (priceId) => {
    setLoading(true);
    setLoadingPackId(priceId);
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
      setLoadingPackId(null);
    }
  };
  // Helper function to get pack icon
  const getPackIcon = (index) => {
    const icons = [Sparkles, Zap, Crown];
    const IconComponent = icons[index] || Star;
    return <IconComponent className="w-8 h-8" />;
  };
  // Helper function to get pack styling
  const getPackStyling = (index, isPopular) => {
    if (isPopular) {
      return {
        cardClass:
          "relative shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-950 transform hover:scale-105",
        iconColor: "text-blue-600",
        priceColor: "text-blue-700 dark:text-blue-300",
        buttonClass:
          "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg",
      };
    }
    return {
      cardClass:
        "shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 hover:scale-102",
      iconColor: "text-gray-600 dark:text-gray-400",
      priceColor: "text-gray-900 dark:text-gray-100",
      buttonClass:
        "bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-white",
    };
  };

  // Helper function to determine if pack is popular (middle one or custom logic)
  const isPopular = (index) => index === 1; // Make middle pack popular

  return (
    <div className="min-h-screen ">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header Section */}
        <div className="text-center mb-12">
          {/* <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-6">
            <Sparkles className="w-8 h-8 text-white" />
          </div> */}
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-4">
            Top Up Credits
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Choose the credit pack to use Spreed.
          </p>
        </div>

        {/* Credit Packs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {creditPacks.map((pack, index) => {
            const popular = isPopular(index);
            const styling = getPackStyling(index, popular);
            const isCurrentlyLoading = loadingPackId === pack.id;

            return (
              <div key={pack.id} className="relative">
                {/* Popular Badge */}
                {/* {popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-1 text-sm font-semibold shadow-lg">
                      ⭐ Most Popular
                    </Badge>
                  </div>
                )} */}

                <Card className={styling.cardClass}>
                  <CardHeader className="text-center pb-4">
                    {/* Icon */}
                    <div
                      className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${popular ? "bg-blue-100 dark:bg-blue-900" : "bg-gray-100 dark:bg-gray-800"}`}
                    >
                      <div className={styling.iconColor}>
                        {getPackIcon(index)}
                      </div>
                    </div>

                    {/* Credits Title */}
                    <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {pack.credits.toLocaleString()} Credits
                    </CardTitle>

                    {/* Price */}
                    <div
                      className={`text-4xl font-bold ${styling.priceColor} mb-2`}
                    >
                      ${pack.price.toFixed(2)}
                    </div>

                    {/* Price per credit */}
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      ${(pack.price / pack.credits).toFixed(4)} per credit
                    </p>
                  </CardHeader>

                  <CardContent className="pt-0">
                    {/* Features or benefits could go here */}
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        Instant delivery
                      </div>
                      {/* <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        No expiration
                      </div> */}
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        Secure payment
                      </div>
                    </div>

                    {/* Purchase Button */}
                    <Button
                      onClick={() => handlePurchase(pack.id)}
                      disabled={loading}
                      className={`w-full py-3 text-lg font-semibold transition-all duration-200 ${styling.buttonClass} disabled:opacity-50`}
                    >
                      {isCurrentlyLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                          Processing...
                        </div>
                      ) : (
                        `Purchase Credits`
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>

        {/* Footer Section */}
        <div className="text-center mt-12">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Secure payments powered by Stripe
          </p>
          <div className="flex justify-center items-center space-x-6">
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              SSL Encrypted
            </div>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              PCI Compliant
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
