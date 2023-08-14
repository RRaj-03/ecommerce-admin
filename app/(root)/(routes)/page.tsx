"use client";
import Modal from "@/components/ui/modal";
import { useModalStore } from "@/hooks/useModalStore";
import { useEffect } from "react";

export default function SetupPage() {
  const onOpen = useModalStore((state) => state.onOpen);
  const isOpen = useModalStore((state) => state.isOpen);
  useEffect(() => {
    if (!isOpen) {
      onOpen();
    }
  }, []);

  return null;
}
