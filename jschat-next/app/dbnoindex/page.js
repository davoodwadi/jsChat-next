// import { connectToDatabase } from "@/lib/db"

export default async function Page() {
  return <></>
}
//   const colName = "testindexunique"
//   const client = await connectToDatabase()
//   const collection = client.db("next").collection(colName)

//   const startTime = new Date()
//   // const pipeline = [ // value counts for email
//   //   {
//   //     $group: {
//   //       _id: "$email", // Group by the email field
//   //       count: { $sum: 1 }, // Count occurrences
//   //     },
//   //   },
//   // ]
//   // const results = await collection.aggregate(pipeline).toArray()

//   // console.log("Email counts:")
//   // results.forEach((result) => {
//   //   console.log(`Email: ${result._id}, Count: ${result.count}`)
//   // })
//   // for (let i = 0; i < 100; i++) {
//   //   await collection.insertOne({ email: "value" + i })
//   //   await collection.findOne({ email: "value" + i })
//   // }
//   const endTime = new Date()
//   console.log("Time taken without index: " + (endTime - startTime) + " ms")
//   return <div>Time taken without index: + {endTime - startTime} + " ms"</div>
// }
