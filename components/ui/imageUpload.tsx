"use client";
import React, { useEffect, useState } from "react";
import { Button } from "./button";
import { Box, ImagePlus, Loader2, Scissors, Trash2, Wand2 } from "lucide-react";
import Image from "next/image";
import { CldUploadWidget } from "next-cloudinary";
import { useParams } from "next/navigation";

interface ImageUploadProps {
  disabled?: boolean;
  onChange: (value: string) => void;
  onRemove: (value: string) => void;
  onEnhance?: (url: string) => void;
  onRemoveBg?: (url: string) => void;
  on3DConvert?: (url: string) => void;
  value: string[];
}

const ImageUpload = ({
  disabled,
  onChange,
  onRemove,
  onEnhance,
  onRemoveBg,
  on3DConvert,
  value,
}: ImageUploadProps) => {
  const [isMounted, setIsMounted] = useState(false);
  // Track per-image loading state: url → which operation is running
  const [processingMap, setProcessingMap] = useState<
    Record<string, "enhance" | "bg-remove" | "3d" | null>
  >({});
  const params = useParams();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const onUpload = (result: any) => {
    onChange(result.info.secure_url);
  };

  const setProcessing = (url: string, op: "enhance" | "bg-remove" | "3d" | null) => {
    setProcessingMap((prev) => ({ ...prev, [url]: op }));
  };

  const handleEnhance = async (url: string) => {
    if (!onEnhance) return;
    setProcessing(url, "enhance");
    try {
      await onEnhance(url);
    } finally {
      setProcessing(url, null);
    }
  };

  const handleRemoveBg = async (url: string) => {
    if (!onRemoveBg) return;
    setProcessing(url, "bg-remove");
    try {
      await onRemoveBg(url);
    } finally {
      setProcessing(url, null);
    }
  };

  const handle3D = async (url: string) => {
    if (!on3DConvert) return;
    setProcessing(url, "3d");
    try {
      await on3DConvert(url);
    } finally {
      setProcessing(url, null);
    }
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-4 flex-wrap">
        {value.map((url) => {
          const processing = processingMap[url];
          const isProcessing = !!processing;

          return (
            <div
              key={url}
              className="relative w-[200px] h-[200px] rounded-md overflow-hidden border border-border"
            >
              {/* Processing overlay */}
              {isProcessing && (
                <div className="absolute inset-0 z-20 bg-black/60 flex flex-col items-center justify-center gap-2 rounded-md">
                  <Loader2 className="h-8 w-8 text-white animate-spin" />
                  <span className="text-white text-xs font-medium">
                    {processing === "enhance" && "Enhancing…"}
                    {processing === "bg-remove" && "Removing BG…"}
                    {processing === "3d" && "Generating 3D…"}
                  </span>
                </div>
              )}

              {/* Action buttons */}
              <div className="z-10 absolute top-2 right-2 flex flex-col gap-y-1">
                {onRemoveBg && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    disabled={isProcessing || disabled}
                    onClick={() => handleRemoveBg(url)}
                    title="Remove Background"
                    className="h-7 w-7"
                  >
                    <Scissors className="h-3.5 w-3.5" />
                  </Button>
                )}
                {on3DConvert && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    disabled={isProcessing || disabled}
                    onClick={() => handle3D(url)}
                    title="Convert to 3D"
                    className="h-7 w-7"
                  >
                    <Box className="h-3.5 w-3.5" />
                  </Button>
                )}
                {onEnhance && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    disabled={isProcessing || disabled}
                    onClick={() => handleEnhance(url)}
                    title="AI Enhance (Replace Background)"
                    className="h-7 w-7"
                  >
                    <Wand2 className="h-3.5 w-3.5" />
                  </Button>
                )}
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  disabled={isProcessing || disabled}
                  onClick={() => onRemove(url)}
                  title="Remove Image"
                  className="h-7 w-7"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>

              <Image src={url} alt="Product image" fill className="object-cover" />
            </div>
          );
        })}
      </div>

      <CldUploadWidget
        onUpload={onUpload}
        uploadPreset="p2qeiq1a"
        options={{ folder: `${params.storeId}` }}
      >
        {({ open }) => {
          const onClick = () => {
            open();
          };

          return (
            <Button
              type="button"
              disabled={disabled}
              variant="secondary"
              onClick={onClick}
            >
              <ImagePlus className="h-4 w-4 mr-2" />
              Upload an Image
            </Button>
          );
        }}
      </CldUploadWidget>
    </div>
  );
};

export default ImageUpload;
