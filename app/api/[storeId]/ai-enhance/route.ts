import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { HfInference } from "@huggingface/inference";
import sharp from "sharp";
import { pipeline } from "@huggingface/transformers";

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
    const { imageUrl, prompt="Change Background" } = await req.json();

    if (!imageUrl) {
      return new NextResponse("Image URL is required", { status: 400 });
    }

    if (!process.env.HUGGINGFACE_API_KEY) {
      return new NextResponse("Hugging Face API Key is missing", { status: 500 });
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

    // 2. Remove Background using transformers.js (briaai/RMBG-1.4)
    // We use the local pipeline if possible.
    // Note: This downloads the model to the container/server. 
    console.log("Initializing segmentation pipeline...");
    const segmenter = await pipeline("image-segmentation", "briaai/RMBG-1.4");
    
    console.log("Segmenting image...");
    const output = await segmenter(imageUrl);
    
    // transformers.js 'image-segmentation' with RMBG-1.4 typically returns the mask/image.
    // It usually returns a generic object that has a 'mask' property or is the mask itself.
    // For RMBG models, they output the mask (RawImage).
    // The output from pipeline('image-segmentation') is Array<{ mark: RawImage, label: string, score: number }> or similar.
    // NOTE: briaai/RMBG-1.4 implementation in transformers.js might return just the mask or array.
    // Let's handle the output dynamically.
    
    let maskBuffer: Buffer;

    
    // Debug Logs
    console.log("Cloud config:", {
        cloud_name: !!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        api_key: !!process.env.CLOUDINARY_API_KEY, 
        api_secret: !!process.env.CLOUDINARY_API_SECRET
    });

    if (Array.isArray(output) && output.length > 0 && output[0].mask) {
        // Standard segmentation output
        const maskImage = output[0].mask;
        // Convert RawImage to Buffer using sharp
        maskBuffer = await sharp((maskImage as any).data, {
            raw: {
                width: (maskImage as any).width,
                height: (maskImage as any).height,
                channels: (maskImage as any).channels
            }
        }).png().toBuffer();
    } else if (output && typeof output === 'object' && 'mask' in output) {
         // @ts-ignore
        const maskImage = output.mask;
         maskBuffer = await sharp((maskImage as any).data, {
            raw: {
                width: (maskImage as any).width,
                height: (maskImage as any).height,
                channels: (maskImage as any).channels
            }
        }).png().toBuffer();
    } else {
        // Fallback or error
        console.error("Unexpected output from segmentation:", output);
        return new NextResponse("Failed to segment image", { status: 500 });
    }

    // 3. Create the foreground with alpha (apply mask)
    // Ensure mask is 1-channel grayscale matching dimensions
    const alphaChannel = await sharp(maskBuffer)
        .resize(metadata.width, metadata.height)
        .grayscale()
        .toBuffer();

    const foregroundBuffer = await inputImage
        .resize(metadata.width, metadata.height) // Ensure match
        .toColourspace('srgb') // Ensure RGB (3 channels)
        .joinChannel(alphaChannel) // Add alpha -> RGBA
        .png()
        .toBuffer();

    // 4. Generate Background
    const bgPrompt = prompt || "professional product photography background, studio lighting, clean, minimalist, high quality, 4k";
    console.log("Generating background with prompt:", bgPrompt);

    const bgResponse = await hf.textToImage({
      inputs: bgPrompt,
      model: "stabilityai/stable-diffusion-xl-base-1.0",
      parameters: {
        negative_prompt: "blurry, low quality, distortion, ugly, text, watemark",
      }
    });

    const bgBuffer = await (bgResponse as unknown as Blob).arrayBuffer();

    // 5. Composite Foreground on Background
    // Resize background to match input image
    const backgroundResized = await sharp(bgBuffer)
      .resize(metadata.width, metadata.height, { fit: 'cover' })
      .toBuffer();

    const finalImageBuffer = await sharp(backgroundResized)
        .composite([{ input: foregroundBuffer }])
        .png() // Convert to PNG
        .toBuffer();

    // 6. Upload to Cloudinary
    // We need to convert buffer to base64 or upload stream.
    // Cloudinary supports base64 upload.
    const base64Image = `data:image/png;base64,${finalImageBuffer.toString('base64')}`;

    const uploadResponse = await cloudinary.uploader.upload(base64Image, {
        folder: "ai-enhanced",
        upload_preset:'p2qeiq1a'
    });

    return NextResponse.json({ url: uploadResponse.secure_url });

  } catch (error) {
    console.error("[AI_ENHANCE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
