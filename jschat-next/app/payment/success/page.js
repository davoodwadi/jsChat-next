"use client"
// import { connectToDatabase } from "@/lib/db"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"

const PaymentSuccess = () => {
  const searchParams = useSearchParams()
  const session_id = searchParams.get("session_id")
  console.log("session_id", session_id)
  const [loading, setLoading] = useState(true)
  const [paymentConfirmed, setPaymentConfirmed] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const checkPaymentStatus = async () => {
      const response = await fetch(
        `/api/stripe/check-payment-status?session_id=${session_id}`
      )

      const data = await response.json()
      if (!response.ok) {
        setLoading(false)
        setError(data.error)
        throw new Error(data.error)
      }
      console.log("data.message", data.message)

      if (data.message === "success") {
        console.log("setPaymentConfirmed")
        setLoading(false)
        setPaymentConfirmed(true)
      } else {
        // If not confirmed, keep polling
        setLoading(false)
        setTimeout(checkPaymentStatus, 3000) // Check every 3 seconds
      }
    }

    if (session_id) {
      checkPaymentStatus()
    }
  }, [session_id])

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>{error}</div>
  }

  if (paymentConfirmed) {
    return <div>Payment was successful!</div>
  }

  return <div>Payment is still being processed...</div>
}

export default PaymentSuccess

// export default async function Page({ searchParams }) {
//   const filters = await searchParams
//   console.log("filters", filters)
//   const session_id = filters.session_id
//   const client = await connectToDatabase()
//   const checkoutCollection = client.db("next").collection("checkouts")
//   const webhookCollection = client.db("next").collection("webhooks")

//   const webhookResult = await webhookCollection.findOne({ id: session_id })
//   console.log("webhookResult", webhookResult)
//   return (
//     <div>
//       <div>Payment successful: {session_id}</div>
//       <div>{JSON.stringify(webhookResult.id)}</div>
//       <div>Topped up: {JSON.stringify(webhookResult.metadata.userId)}</div>
//     </div>
//   )
// }
