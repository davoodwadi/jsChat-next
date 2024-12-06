// import sessionCollection from "@/lib/db"
import { connectToDatabase } from "@/lib/db"
import Image from "next/image"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { signOut } from "@/auth"
import Toast from "../components/Toast"

export default async function Movies() {
  // const session = await auth()
  // if (!session) {
  //   redirect("/signin")
  // }
  const session = await auth()
  console.log("session", session)
  const client = await connectToDatabase()
  const db = client.db("next")
  const collection = db.collection("users")
  const comment = await collection.findOne({ email: "davood.wadi@hec.ca" })
  // console.log("comment:", comment)

  return (
    <div>
      movies list:
      <ul>
        <li key={1}>{comment?.given_name}</li>
        <li key={2}>{comment?.family_name}</li>
        <li key={3}>{comment?.email}</li>
        <li key={4}>
          <img src={comment?.picture || comment?.image}></img>
        </li>

        <li key={5}>{JSON.stringify(comment?.email_verified)}</li>
      </ul>
      <form
        action={async () => {
          "use server"
          await signOut()
        }}
      >
        <button type="submit">Sign Out</button>
      </form>
      <Toast>Welcome</Toast>
    </div>
  )
}
