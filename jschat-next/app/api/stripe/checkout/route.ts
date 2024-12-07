import Stripe from "stripe"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { connectToDatabase } from "@/lib/db"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)
export async function POST(request: NextRequest) {
  try {
    // you can implement some basic check here like, is user valid or not
    const client = await connectToDatabase()
    const collection = client.db("next").collection("checkouts")
    const session = await auth()
    const user = session.user
    if (!user) {
      return NextResponse.json({ result: null, ok: false })
    }

    const data = await request.json()
    const priceId = data.priceId
    const checkoutSession: Stripe.Checkout.Session =
      await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${process.env.NEXT_BASE_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_BASE_URL}/payment/failure?session_id={CHECKOUT_SESSION_ID}`,
        metadata: {
          userId: user.email,
          priceId,
        },
      })
    console.log("checkoutSession", checkoutSession)
    try {
      const resp = await collection.insertOne(checkoutSession)
      console.log("checkoutSession added", resp)
    } catch (e) {
      if ((e.code = 11000)) {
        console.error("duplicate checkout id")
      } else {
        console.error("db op failed:", e.code)
      }
    }

    return NextResponse.json({ result: checkoutSession, ok: true })
  } catch (error) {
    console.log(error)
    return new NextResponse("Internal Server", { status: 500 })
  }
}
