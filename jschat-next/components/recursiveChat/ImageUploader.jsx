import { useState } from "react";
import { X, Camera, ImagePlus } from "lucide-react";

const ImageUploader = ({ base64Image, setBase64Image, showPreview = true }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const convertHeicToJpeg = async (heicFile) => {
    try {
      let jpegBlob;
      // Dynamic import to avoid SSR issues
      const heic2any = (await import("heic2any")).default;

      try {
        jpegBlob = await heic2any({
          blob: heicFile,
          toType: "image/jpeg",
          quality: 0.8,
        });
      } catch (error) {
        jpegBlob = heicFile;
      }

      return new File([jpegBlob], heicFile.name.replace(/\.heic$/i, ".jpg"), {
        type: "image/jpeg",
      });
    } catch (error) {
      console.error("Error converting HEIC:", error);
      throw error;
    }
  };

  const compressImage = (
    file,
    quality = 0.8,
    maxWidth = 400,
    maxHeight = 400
  ) => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        let { width, height } = img;

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(resolve, "image/jpeg", quality);
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsProcessing(true);

    try {
      let processedFile = file;

      // Handle HEIC files
      processedFile = await convertHeicToJpeg(file);

      // Compress image
      const compressedFile = await compressImage(
        processedFile,
        0.8,
        1024,
        1024
      );

      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        setBase64Image(reader.result);
        setIsProcessing(false);
      };
      reader.onerror = () => {
        alert("Error reading file");
        setIsProcessing(false);
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error("Error processing image:", error);
      alert("Error processing image. Please try again.");
      setIsProcessing(false);
    }
    // Clear the input value so the same file can be selected again
    e.target.value = "";
  };
  const clearImage = () => {
    setBase64Image("");
  };
  return (
    <div className="flex items-center gap-4">
      {/* <label htmlFor="image-upload" className="cursor-pointer">
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
            isProcessing
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600 text-white"
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>{isProcessing ? "Processing..." : "Add Photo"}</span>
        </div>
      </label> */}
      {/* 
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
        id="image-upload"
        disabled={isProcessing}
      /> */}
      <label className=" my-auto mr-6 p-2 rounded cursor-pointer hover:bg-gray-400 dark:hover:bg-gray-800">
        <ImagePlus className={`w-4 h-4 ${isProcessing && "animate-pulse"}`} />
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
          disabled={isProcessing}
        />
      </label>
    </div>
  );
};

export default ImageUploader;
