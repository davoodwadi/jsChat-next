// import { openai } from "@ai-sdk/openai"
// import { streamText, tool } from "ai"
// import { z } from "zod"
import { NextResponse, NextRequest } from "next/server";
// // Allow streaming responses up to 30 seconds
// export const maxDuration = 30
export const runtime = "edge";

export async function POST(req) {
  const data = await req.json();
  console.log("body", typeof data.duration);
  console.log("route runtime", process.env.NEXT_RUNTIME);
  const stream = new ReadableStream({
    start(controller) {
      // Function to enqueue data with a delay
      const enqueueWithDelay = (data, delay) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            controller.enqueue(new TextEncoder().encode(data));
            resolve();
          }, delay);
        });
      };
      const streamData = async () => {
        for (let i = 0; i < data.duration; i++) {
          await enqueueWithDelay(`${i}s`, 1000);
        }
        controller.close(); // Close the stream
      };

      // Start streaming the data
      streamData();
    },
  });
  // Return a new Response with the stream
  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
}
export async function GET(req) {
  // console.log("header:", req.headers);
  console.log("runtime", process.env.NEXT_RUNTIME);

  // return Response.json({name: 'hello'}, {status:200})
  const stream = new ReadableStream({
    start(controller) {
      // Function to enqueue data with a delay
      const enqueueWithDelay = (data, delay) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            controller.enqueue(new TextEncoder().encode(data));
            resolve();
          }, delay);
        });
      };

      // Create an async function to handle the streaming
      const streamData = async () => {
        for (let i = 0; i < 80; i++) {
          await enqueueWithDelay(`${i}s`, 1000);
        }
        controller.close(); // Close the stream
      };

      // Start streaming the data
      streamData();
    },
  });
  // Return a new Response with the stream
  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
}
async function wait(duration) {
  return new Promise((resolve) => setTimeout(resolve, duration));
}
