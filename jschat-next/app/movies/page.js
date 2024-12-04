// import sessionCollection from "@/lib/db"
import { getSampleDb, nextDb } from "@/lib/db"
import client from "@/lib/db"

export default async function Movies() {
  //   const user = await sessionCollection.findOne({ username: "a" })
  //   console.log("user:", user)
  //   const comment = await getSampleDb()
  //   console.log("client:", client)
  //   const db = client.db("next")
  const db = nextDb
  const collection = db.collection("test")
  const comment = await collection.findOne({ username: "davoodwadi" })
  console.log("comment:", comment)

  return (
    <div>
      movies list:
      <ul>
        <li key={1}>{comment?.username}</li>
        <li key={2}>{comment?.saveContainer}</li>
      </ul>
    </div>
  )
}
