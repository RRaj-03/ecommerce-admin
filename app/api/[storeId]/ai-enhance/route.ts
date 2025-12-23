import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { HfInference } from "@huggingface/inference";
import sharp from "sharp";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure HF Inference
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { imageUrl, prompt = "Change Background" } = await req.json();

    if (!imageUrl) {
      return new NextResponse("Image URL is required", { status: 400 });
    }

    if (!process.env.HUGGINGFACE_API_KEY) {
      return new NextResponse("Hugging Face API Key is missing", {
        status: 500,
      });
    }

    console.log("Processing image:", imageUrl);

    // 1. Fetch the input image to get dimensions and data
    const inputResponse = await fetch(imageUrl);
    const inputBuffer = await inputResponse.arrayBuffer();
    const inputImage = sharp(inputBuffer);
    const metadata = await inputImage.metadata();

    if (!metadata.width || !metadata.height) {
      return new NextResponse("Invalid image", { status: 400 });
    }

    // 2. Remove Background using HF Inference API (briaai/RMBG-1.4)
    console.log("Segmenting image via HF API...");
    const segmentationResponse = await fetch(
      "https://api-inference.huggingface.co/models/briaai/RMBG-1.4",
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: inputBuffer,
      }
    );

    if (!segmentationResponse.ok) {
      const errorText = await segmentationResponse.text();
      console.error("Segmentation API failed:", errorText);
      throw new Error("Failed to segment image via API");
    }

    const output = await segmentationResponse.json();

    let maskBuffer: Buffer;

    // The API for briaai/RMBG-1.4 typically returns an array of objects with a 'mask' property (base64)
    // or sometimes just the image (blob) depending on specific model pipeline.
    // However, the standard image-segmentation pipeline returns [{ label, mask, score }].

    if (Array.isArray(output) && output.length > 0 && output[0].mask) {
      // output[0].mask is a base64 string for image-segmentation
      maskBuffer = Buffer.from(output[0].mask, "base64");
    } else {
      // Fallback: Check if response itself is directly an image (sometimes happens with specific widgets?)
      // But since we parsed json(), it must be JSON.
      console.error("Unexpected output format from segmentation API:", output);
      return new NextResponse(
        "Failed to segment image: Unexpected API response",
        { status: 500 }
      );
    }

    // 3. Create the foreground with alpha (apply mask)
    // Ensure mask is 1-channel grayscale matching dimensions
    const alphaChannel = await sharp(maskBuffer)
      .resize(metadata.width, metadata.height)
      .grayscale()
      .toBuffer();

    const foregroundBuffer = await inputImage
      .resize(metadata.width, metadata.height) // Ensure match
      .toColourspace("srgb") // Ensure RGB (3 channels)
      .joinChannel(alphaChannel) // Add alpha -> RGBA
      .png()
      .toBuffer();

    // 4. Generate Background
    const bgPrompt =
      prompt ||
      "professional product photography background, studio lighting, clean, minimalist, high quality, 4k";
    console.log("Generating background with prompt:", bgPrompt);

    const bgResponse = await hf.textToImage({
      inputs: bgPrompt,
      model: "stabilityai/stable-diffusion-xl-base-1.0",
      parameters: {
        negative_prompt:
          "blurry, low quality, distortion, ugly, text, watemark",
      },
    });

    const bgBuffer = await (bgResponse as unknown as Blob).arrayBuffer();

    // 5. Composite Foreground on Background
    // Resize background to match input image
    const backgroundResized = await sharp(bgBuffer)
      .resize(metadata.width, metadata.height, { fit: "cover" })
      .toBuffer();

    const finalImageBuffer = await sharp(backgroundResized)
      .composite([{ input: foregroundBuffer }])
      .png() // Convert to PNG
      .toBuffer();

    // 6. Upload to Cloudinary
    // We need to convert buffer to base64 or upload stream.
    // Cloudinary supports base64 upload.
    const base64Image = `data:image/png;base64,${finalImageBuffer.toString(
      "base64"
    )}`;

    const uploadResponse = await cloudinary.uploader.upload(base64Image, {
      folder: "ai-enhanced",
      upload_preset: "p2qeiq1a",
    });

    return NextResponse.json({ url: uploadResponse.secure_url });
  } catch (error) {
    console.error("[AI_ENHANCE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
