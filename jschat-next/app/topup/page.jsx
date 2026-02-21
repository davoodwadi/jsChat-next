"use client";

import axios from "axios";
import { useState } from "react";
import Link from "next/link";
import { loadStripe } from "@stripe/stripe-js";
import { Button } from "@/components/ui/button"; // Assuming you're using shadcn/ui or similar for UI components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { creditPacks } from "@/components/payment/PaymentConfig";
import { Sparkles, Zap, Crown, Star, ArrowLeft } from "lucide-react";

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
    return <IconComponent className="w-4 h-4" />;
  };
  // Helper function to get pack styling
  const getPackStyling = (index, isPopular) => {
    if (isPopular) {
      return {
        cardClass:
          "relative glass-strong shadow-xl transition-all duration-500 border-2 border-spreed-blue/50 transform hover:shadow-[0_0_40px_rgba(31,159,255,0.25)] dark:hover:shadow-[0_0_50px_rgba(31,159,255,0.15)]",
        iconColor: "text-spreed-blue",
        priceColor: "text-spreed-blue dark:text-spreed-blue-dark",
        buttonClass:
          "bg-gradient-to-r from-spreed-blue to-spreed-blue-dark hover:brightness-110 text-white shadow-lg",
      };
    }
    return {
      cardClass:
        "glass shadow-lg transition-all duration-500 border border-white/20 dark:border-white/10 hover:shadow-[0_0_30px_rgba(255,192,80,0.15)] dark:hover:shadow-[0_0_40px_rgba(255,192,80,0.1)]",
      iconColor: "text-muted-foreground",
      priceColor: "text-foreground",
      buttonClass: "glass-button-dark",
    };
  };

  // Helper function to determine if pack is popular (middle one or custom logic)
  const isPopular = (index) => index === 1; // Make middle pack popular

  return (
    <div className="min-h-screen bg-transparent">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Back Button */}
        <div className="mb-8">
          <Link href="/">
            <Button
              variant="ghost"
              className="group flex items-center gap-2 text-muted-foreground hover:text-foreground transition-all duration-300 px-0 hover:bg-transparent"
            >
              <div className="p-2 rounded-full glass-subtle group-hover:bg-spreed-blue/10 group-hover:text-spreed-blue transition-all duration-300">
                <ArrowLeft className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium tracking-wide"></span>
            </Button>
          </Link>
        </div>

        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-spreed-blue via-spreed-yellow to-spreed-blue bg-clip-text text-transparent mb-3 tracking-tight">
            Top Up Credits
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            Choose a credit pack to continue your non-linear conversation.
          </p>
        </div>

        {/* Credit Packs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {creditPacks.map((pack, index) => {
            const popular = isPopular(index);
            const styling = getPackStyling(index, popular);
            const isCurrentlyLoading = loadingPackId === pack.id;

            return (
              <div key={pack.id} className="relative">
                <Card className={styling.cardClass}>
                  <CardHeader className="text-center pb-2">
                    {/* Icon */}
                    <div
                      className={`inline-flex items-center justify-center w-10 h-10 rounded-full mb-3 ${popular ? "bg-spreed-blue/10 dark:bg-spreed-blue/20" : "bg-white/5 dark:bg-black/20"}`}
                    >
                      <div className={styling.iconColor}>
                        {getPackIcon(index)}
                      </div>
                    </div>

                    {/* Credits Title */}
                    <CardTitle className="text-xl font-semibold mb-1 tracking-tight">
                      {pack.credits.toLocaleString()} Credits
                    </CardTitle>

                    {/* Price */}
                    <div
                      className={`text-3xl font-bold ${styling.priceColor} mb-1`}
                    >
                      ${pack.price.toFixed(2)}
                    </div>
                  </CardHeader>

                  <CardContent className="pt-2">
                    {/* Features or benefits could go here */}
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center text-xs text-muted-foreground/80">
                        <div className="w-1.5 h-1.5 bg-spreed-blue/60 rounded-full mr-2"></div>
                        Instant delivery
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground/80">
                        <div className="w-1.5 h-1.5 bg-spreed-yellow/60 rounded-full mr-2"></div>
                        Secure payment
                      </div>
                    </div>

                    {/* Purchase Button */}
                    <Button
                      onClick={() => handlePurchase(pack.id)}
                      disabled={loading}
                      className={`w-full py-5 text-sm font-medium transition-all duration-200 ${styling.buttonClass} disabled:opacity-50 rounded-lg`}
                    >
                      {isCurrentlyLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                          Processing...
                        </div>
                      ) : (
                        `Select`
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
          <p className="text-sm text-muted-foreground mb-4">
            Secure payments powered by Stripe
          </p>
          <div className="flex justify-center items-center space-x-6">
            <div className="flex items-center text-xs text-muted-foreground">
              <div className="w-2 h-2 bg-spreed-blue rounded-full mr-2"></div>
              SSL Encrypted
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <div className="w-2 h-2 bg-spreed-yellow rounded-full mr-2"></div>
              PCI Compliant
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
