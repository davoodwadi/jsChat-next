"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { ImagePlus } from "lucide-react";
export default function Page() {
  const [input, setInput] = useState("");
  const [image, setImage] = useState();
  const [previewUrl, setPreviewUrl] = useState();
  const [base64Image, setBase64Image] = useState("");
  const [response, setResponse] = useState();
  const developerMessage = "You are a helpful pirate.";
  const messages = [
    { role: "developer", content: developerMessage },
    {
      role: "user",
      content: [
        { type: "text", text: input },
        { type: "image_url", image_url: { url: base64Image } },
      ],
    },
  ];
  console.log("messages", messages);
  //   console.log("base64Image", base64Image);

  const onSubmit = async (e) => {
    //   console.log(e);
    const data = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/openai`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: messages,
        model: "gpt-4o-mini",
      }),
    });
    if (!data.ok) {
      console.error(data.status);
    }
    const reader = data.body.getReader();
    const decoder = new TextDecoder();
    let tempChunks = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      // console.log('Received chunk:', chunk);

      tempChunks = chunk ? tempChunks + chunk : tempChunks;
      setResponse(tempChunks);
    }
  };
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      //   console.log("Selected image:", file.name);
      //   encode image to Base64
      const reader = new FileReader();
      reader.onloadend = () => {
        setBase64Image(reader.result); // this includes the data URI prefix
        // console.log("Base64 image:", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  return (
    <>
      <Textarea
        className="mr-2 ml-2 px-2"
        onChange={(e) => {
          setInput(e.target.value);
        }}
      />
      <label className="inline-flex items-center gap-2 cursor-pointer hover:text-gray-300 text-sm mx-2 my-2">
        <ImagePlus className="w-5 h-5" />
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </label>
      {previewUrl && (
        <div className="mx-2 my-2">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-24 h-24 object-cover border rounded shadow"
          />
        </div>
      )}
      <Button className="mx-auto p-2 my-2" onClick={onSubmit}>
        Submit
      </Button>
      <div className="p-4">{response}</div>
    </>
  );
}
