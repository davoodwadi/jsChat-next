// This approach is taken from https://github.com/vercel/next.js/tree/canary/examples/with-mongodb
import { MongoClient, ServerApiVersion } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;
const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
};

let client: MongoClient;

// connect only once to mongodb
export async function connectToDatabase() {
  try {
    if (client) {
      // console.log("client exists returning");
      return client;
    }
    if (process.env.NODE_ENV === "development") {
      //
      let globalWithMongo = global as typeof globalThis & {
        _mongoClient?: MongoClient;
      };

      if (!globalWithMongo._mongoClient) {
        console.log("connecting to db and setting global in dev mode");
        client = await new MongoClient(uri, options).connect();
        globalWithMongo._mongoClient = client;
      } else {
        console.log("global db connection exists. getting that");
        client = globalWithMongo._mongoClient;
      }
      //

      // if (!global._mongoClient) {
      //   console.log("connecting to db and setting global in dev mode")
      //   client = await new MongoClient(uri, options).connect()
      //   global._mongoClient = client
      // } else {
      //   console.log("global db connection exists. getting that")
      //   client = global._mongoClient
      // }
    } else {
      console.log("connecting to db in production");
      client = await new MongoClient(uri, options).connect();
    }
    // database = await mongoClient.db(process.env.NEXT_ATLAS_DATABASE);
    return client;
  } catch (e) {
    console.error(e);
  }
}

// if (process.env.NODE_ENV === "development") {
//   // In development mode, use a global variable so that the value
//   // is preserved across module reloads caused by HMR (Hot Module Replacement).
//   let globalWithMongo = global as typeof globalThis & {
//     _mongoClient?: MongoClient;
//   };

//   if (!globalWithMongo._mongoClient) {
//     globalWithMongo._mongoClient = new MongoClient(uri, options);
//   }
//   console.log("creating MongoDb connection in dev mode");
//   client = globalWithMongo._mongoClient;
// } else {
//   // In production mode, it's best to not use a global variable.
//   console.log("creating MongoDb connection in production mode");
//   client = new MongoClient(uri, options);
// }

export async function getSampleDb() {
  const db = client.db("sample_mflix");
  const collection = db.collection("comments");
  const comment = await collection.findOne({
    email: "mercedes_tyler@fakegmail.com",
  });
  console.log("db.ts comment", comment);
  return comment;
}

// export const nextDb = client.db("next")
// const sessionCollection = sessionDb.collection("session-next")
// const sessionCollection = sessionDb.collection("chatSessions-test")

// export default sessionCollection
// Export a module-scoped MongoClient. By doing this in a
// separate module, the client can be shared across functions.
// export default client
