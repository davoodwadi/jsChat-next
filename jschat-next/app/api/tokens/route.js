import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";

export async function POST(req) {
  const data = await req.json();
    const amount = data.amount
    const email = data.email

  if (!amount) {
    return Response.json( { tokensRemaining: null}, { status: 400} );
  }
  // console.log('email', email)

  const client = await connectToDatabase();
  const plansCollection = client.db("chat").collection("plans");
  const result = await plansCollection.findOneAndUpdate(
    { username: email },
    {
      $inc: { tokensRemaining: -amount },
    },
    {
      returnDocument: "after",
      projection: { tokensRemaining: 1 },
    }
  );
  // console.log('result', result)
  return Response.json( { tokensRemaining: result.tokensRemaining}, {status: 200 })
}