import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import sharp from "sharp";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return new NextResponse("Image URL is required", { status: 400 });
    }

    if (!process.env.HUGGINGFACE_API_KEY) {
      return new NextResponse("Hugging Face API Key is missing", {
        status: 500,
      });
    }

    console.log("[BG_REMOVE] Processing image:", imageUrl);

    // 1. Fetch the input image
    const inputResponse = await fetch(imageUrl);
    if (!inputResponse.ok) {
      return new NextResponse("Failed to fetch source image", { status: 400 });
    }
    const inputBuffer = await inputResponse.arrayBuffer();
    const inputImage = sharp(inputBuffer);
    const metadata = await inputImage.metadata();

    if (!metadata.width || !metadata.height) {
      return new NextResponse("Invalid image dimensions", { status: 400 });
    }

    // 2. Remove background via HuggingFace briaai/RMBG-1.4
    console.log("[BG_REMOVE] Calling HuggingFace segmentation API...");
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
      console.error("[BG_REMOVE] Segmentation API failed:", errorText);
      return new NextResponse(`Background removal failed: ${errorText}`, {
        status: 500,
      });
    }

    const segOutput = await segmentationResponse.json();

    let maskBuffer: Buffer;

    if (Array.isArray(segOutput) && segOutput.length > 0 && segOutput[0].mask) {
      maskBuffer = Buffer.from(segOutput[0].mask, "base64");
    } else {
      console.error("[BG_REMOVE] Unexpected segmentation output:", segOutput);
      return new NextResponse("Unexpected segmentation response format", {
        status: 500,
      });
    }

    // 3. Apply mask as alpha channel → transparent PNG
    console.log("[BG_REMOVE] Applying alpha mask...");
    const alphaChannel = await sharp(maskBuffer)
      .resize(metadata.width, metadata.height)
      .grayscale()
      .toBuffer();

    const transparentPngBuffer = await sharp(inputBuffer)
      .resize(metadata.width, metadata.height)
      .toColourspace("srgb")
      .joinChannel(alphaChannel)
      .png()
      .toBuffer();

    // 4. Upload transparent PNG to Cloudinary
    console.log("[BG_REMOVE] Uploading to Cloudinary...");
    const base64Image = `data:image/png;base64,${transparentPngBuffer.toString(
      "base64"
    )}`;

    const uploadResponse = await cloudinary.uploader.upload(base64Image, {
      folder: `${params.storeId}/ai-bg-removed`,
      upload_preset: "p2qeiq1a",
    });

    console.log("[BG_REMOVE] Done:", uploadResponse.secure_url);
    return NextResponse.json({ url: uploadResponse.secure_url });
  } catch (error) {
    console.error("[BG_REMOVE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
