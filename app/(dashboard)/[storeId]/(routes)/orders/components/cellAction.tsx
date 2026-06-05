"use client";
import React, { useState } from "react";
import { OrderColumn } from "./columns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, MoreHorizontal, Truck, Eye } from "lucide-react";
import { toast } from "react-hot-toast";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";

const STATUS_LABELS = [
  { name: "Ordered", value: "Ordered" },
  { name: "Processing", value: "Processing" },
  { name: "Shipped", value: "Shipped" },
  { name: "Out for Delivery", value: "Out for Delivery" },
  { name: "Delivered", value: "Delivered" },
  { name: "Cancelled", value: "Cancelled" },
  { name: "Refunded", value: "Refunded" },
];

export const CellAction = ({ data }: { data: OrderColumn }) => {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [trackingOpen, setTrackingOpen] = useState(false);
  const [trackingData, setTrackingData] = useState({
    trackingNumber: "",
    carrier: "",
    trackingUrl: "",
  });

  const onCopy = (id: string, label: string) => {
    navigator.clipboard.writeText(id);
    toast.success(`${label} copied to clipboard`);
  };

  const onStatusChange = async (newStatus: string) => {
    try {
      setLoading(true);
      await axios.patch(`/api/${params.storeId}/orders/${data.id}`, {
        status: newStatus,
      });
      router.refresh();
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      toast.error("Failed to update order status");
    } finally {
      setLoading(false);
    }
  };

  const onTrackingSave = async () => {
    try {
      setLoading(true);
      await axios.patch(`/api/${params.storeId}/orders/${data.id}`, {
        ...trackingData,
        status: "Shipped",
        note: `Shipped via ${trackingData.carrier}: ${trackingData.trackingNumber}`,
      });
      setTrackingOpen(false);
      router.refresh();
      toast.success("Tracking details saved & order marked as Shipped");
    } catch (error) {
      toast.error("Failed to save tracking details");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={trackingOpen} onOpenChange={setTrackingOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Tracking Details</DialogTitle>
            <DialogDescription>
              Enter shipment tracking information for order #{data.id.slice(0, 8)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Carrier</Label>
              <Input
                placeholder="Delhivery, BlueDart, India Post..."
                value={trackingData.carrier}
                onChange={(e) =>
                  setTrackingData((prev) => ({ ...prev, carrier: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Tracking Number</Label>
              <Input
                placeholder="AWB / tracking number"
                value={trackingData.trackingNumber}
                onChange={(e) =>
                  setTrackingData((prev) => ({
                    ...prev,
                    trackingNumber: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Tracking URL (optional)</Label>
              <Input
                placeholder="https://track.carrier.com/..."
                value={trackingData.trackingUrl}
                onChange={(e) =>
                  setTrackingData((prev) => ({
                    ...prev,
                    trackingUrl: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTrackingOpen(false)}>
              Cancel
            </Button>
            <Button onClick={onTrackingSave} disabled={loading}>
              {loading ? "Saving..." : "Save & Mark Shipped"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={"ghost"} className="h-8 w-8 p-0">
            <span className="sr-only">Open Menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => onCopy(data.id, "Order ID")}>
            <Copy className="mr-2 w-4 h-4" />
            Copy Order Id
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onCopy(data.transactionId, "Transaction ID")}
          >
            <Copy className="mr-2 w-4 h-4" />
            Copy Transaction Id
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setTrackingOpen(true)}>
            <Truck className="mr-2 w-4 h-4" />
            Add Tracking
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Update Status</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup
                value={data.status}
                onValueChange={onStatusChange}
              >
                {STATUS_LABELS.map((label) => (
                  <DropdownMenuRadioItem
                    key={label.value}
                    value={label.value}
                  >
                    {label.name}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
