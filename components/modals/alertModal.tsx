"use client";
import React, { useEffect, useState } from "react";
import Modal from "../ui/modal";
import { Button } from "../ui/button";

interface alertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}

const AlertModal = ({
  isOpen,
  loading,
  onClose,
  onConfirm,
}: alertModalProps) => {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <Modal
      title="Are you sure?"
      description="This action cannot be undone"
      onClose={onClose}
      isOpen={isOpen}
    >
      <div className="pt-6 space-x-2 flex items-center justify-end w-full">
        <Button variant={"outline"} disabled={loading} onClick={onClose}>
          Cancel
        </Button>
        <Button variant={"destructive"} disabled={loading} onClick={onConfirm}>
          Continue
        </Button>
      </div>
    </Modal>
  );
};

export default AlertModal;
