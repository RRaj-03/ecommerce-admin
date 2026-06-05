import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Extracts the Cloudinary public_id from a Cloudinary URL.
 * E.g. "https://res.cloudinary.com/cloud/image/upload/v123/folder/image.png"
 *      → "folder/image"
 */
function extractPublicId(cloudinaryUrl: string): string | null {
  try {
    const url = new URL(cloudinaryUrl);
    // path: /cloud/image/upload/v1234567890/folder/filename.ext
    const parts = url.pathname.split("/");
    const uploadIdx = parts.indexOf("upload");
    if (uploadIdx === -1) return null;

    // Skip the version segment if present (starts with 'v' followed by digits)
    let startIdx = uploadIdx + 1;
    if (/^v\d+$/.test(parts[startIdx])) {
      startIdx++;
    }

    const rest = parts.slice(startIdx).join("/");
    // Remove extension
    return rest.replace(/\.[^/.]+$/, "");
  } catch {
    return null;
  }
}

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return new NextResponse("Image URL is required", { status: 400 });
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (!cloudName) {
      return new NextResponse("Cloudinary cloud name is not configured", {
        status: 500,
      });
    }

    console.log("[AI_3D] Processing image:", imageUrl);

    // Strategy: Upload the image to Cloudinary (if not already there), then
    // apply Cloudinary's generative AI transformation to produce a 3D studio render.
    //
    // We use Cloudinary's URL-based transformation with:
    //   - e_background_removal   → strip background
    //   - e_gen_background_replace:prompt_<3D studio prompt> → add 3D studio background
    //
    // This is a chained transformation via Cloudinary's upload + eager transforms.

    // Step 1: Upload the source image (or re-upload to ensure it's in our account)
    console.log("[AI_3D] Uploading source to Cloudinary...");
    const uploadResponse = await cloudinary.uploader.upload(imageUrl, {
      folder: `${params.storeId}/ai-3d-source`,
      upload_preset: "p2qeiq1a",
      // Apply eager transformation: background removal + 3D background generation
      eager: [
        {
          transformation: [
            // Step 1: Remove the background using Cloudinary AI
            { effect: "background_removal" },
            // Step 2: Replace background with a 3D photorealistic studio render
            {
              effect:
                "gen_background_replace:prompt_3d render product photography, photorealistic studio, soft shadows, 8k, professional lighting, clean modern background",
            },
          ],
          format: "png",
          quality: "auto",
        },
      ],
      eager_async: false, // Wait for transformation to complete
    });

    // The eager result contains the transformed URL
    const eager = uploadResponse.eager;
    if (!eager || eager.length === 0) {
      // Fallback: return a Cloudinary URL with the transformation applied inline
      // This happens if eager transforms aren't available on the plan
      const publicId = uploadResponse.public_id;
      const fallbackUrl = cloudinary.url(publicId, {
        transformation: [
          { effect: "background_removal" },
          {
            effect:
              "gen_background_replace:prompt_3d render product photography, photorealistic studio, soft shadows, 8k, professional lighting, clean modern background",
          },
        ],
        format: "png",
        quality: "auto",
        secure: true,
      });

      console.log("[AI_3D] Using inline transformation URL:", fallbackUrl);

      // Re-upload the transformed image so it's stored as a concrete asset
      const finalUpload = await cloudinary.uploader.upload(fallbackUrl, {
        folder: `${params.storeId}/ai-3d`,
        upload_preset: "p2qeiq1a",
      });

      return NextResponse.json({ url: finalUpload.secure_url });
    }

    const transformedUrl = eager[0].secure_url;
    console.log("[AI_3D] Done:", transformedUrl);
    return NextResponse.json({ url: transformedUrl });
  } catch (error: any) {
    console.error("[AI_3D_ERROR]", error);
    return new NextResponse(
      error?.message || "Internal Error",
      { status: 500 }
    );
  }
}
