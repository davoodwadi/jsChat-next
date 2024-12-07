import { connectToDatabase } from "@/lib/db"

export default async function Page() {
  const colName = "webhooks"
  const client = await connectToDatabase()
  const collection = client.db("next").collection(colName)
  // collection.createIndex({ email: 1 }, { unique: true })
  const startTime = new Date()
  // try {
  //   const resp = await collection.insertOne({
  //     id: "cs_test_a16oAdXY5xOSdxfwZcoUCZmpcjWyt0sWp1Pg3QdGy0PDNpEJOQho1sk4vv",
  //   })
  //   console.log("resp", resp)
  // } catch (e) {
  //   if ((e.code = 11000)) {
  //     console.error("duplicate id")
  //   } else {
  //     console.error("db op failed:", e.code)
  //   }
  // }

  // const results = await collection.find({}).toArray()
  // console.log("results", typeof results[0].id)
  // console.log("results", results[0].id)
  //   for (let i = 0; i < 100; i++) {
  //     await collection.insertOne({ email: "value" + i })
  //     await collection.findOne({ email: "value" + i })
  //   }
  const endTime = new Date()
  console.log("Time taken without index: " + (endTime - startTime) + " ms")
  return <div>Time taken without index: + {endTime - startTime} + " ms"</div>
}
