import { connectToDatabase } from "@/lib/db"
import { auth } from "@/auth"
import { essentialProjection } from "@/auth"

export default async function Page() {
  const session = await auth()
  console.log("session", session?.user)
  const client = await connectToDatabase()
  const plansCollection = client.db("chat").collection("plans")
  const plansUser = await plansCollection.findOne(
    { username: session?.user?.email },
    { projection: essentialProjection }
  )

  // return <UserMessage>profile page 1</UserMessage>
  return <div>{JSON.stringify(plansUser)}</div>
}
