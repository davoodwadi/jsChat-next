"use client"

import { loadStripe } from "@stripe/stripe-js"
import axios from "axios"
import { Button } from "@/components/ui/button"

type props = {
  priceId: string
  price: string
  description: string
}
export default function PaymentComponent({
  priceId,
  price,
  description,
}: props) {
  const handleSubmit = async () => {
    const stripe = await loadStripe(
      process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY as string
    )
    if (!stripe) {
      console.error("Could not load stripe.")
      return
    }
    try {
      const response = await axios.post("/api/stripe/checkout", {
        priceId: priceId,
      })
      const data = response.data
      // console.log("data", data)
      if (!data.ok) throw new Error("Something went wrong")
      await stripe.redirectToCheckout({
        sessionId: data.result.id,
      })
    } catch (error) {
      console.log(error)
    }
  }
  return (
    <Button className="mx-2" onClick={handleSubmit}>
      Top up {price}
    </Button>
  )
}
