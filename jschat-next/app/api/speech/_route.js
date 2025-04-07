import path from "path";
import fs from "fs";
import { NextResponse } from "next/server";
import { wait } from "@/lib/actions";
export async function POST(req) {
  const data = await req.json();
  console.log("SERVER REQUEST data", data);

  const audioPath = path.join(process.cwd(), "public", "labyrinth.mp3");
  console.log("SERVER audioPath", audioPath);
  const stat = fs.statSync(audioPath);
  const fileSize = stat.size;
  console.log("SERVER fileSize", fileSize);
  const audioStream = fs.createReadStream(audioPath, {
    highWaterMark: 64 * 1024,
  }); // 64KB chunks

  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of audioStream) {
        console.log("SERVER chunk length:", chunk.length);
        await wait(2000); // 500ms delay per chunk
        controller.enqueue(chunk);
      }
      controller.close();
    },
    cancel(reason) {
      console.log("Stream cancelled:", reason);
    },
  });

  return new NextResponse(stream, {
    status: 200,
    headers: {
      "Content-Type": "audio/mpeg",
      "Content-Length": fileSize.toString(),
      "Accept-Ranges": "bytes",
    },
  });
}

const audioStream = async (readableStreamDefaultWriter) => {
  const stream = fs.createReadStream(audioPath);

  // Pipe the audio stream to the response
  stream.on("data", (chunk) => {
    readableStreamDefaultWriter.write(chunk);
  });

  stream.on("end", () => {
    readableStreamDefaultWriter.close();
  });

  stream.on("error", (error) => {
    console.error("Error streaming audio:", error);
    readableStreamDefaultWriter.close();
  });
};
