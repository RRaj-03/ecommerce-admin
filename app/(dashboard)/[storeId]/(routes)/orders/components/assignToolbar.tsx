"use client";

import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckSquare, UserCheck, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AssignToolbarProps {
  storeId: string;
  selectedOrderIds: string[];
  assignableMembers: { id: string; name: string; roleName: string }[];
  canAssign: boolean;
  canUpdateStatus: boolean;
  onClearSelection: () => void;
}

export const AssignToolbar = ({
  storeId,
  selectedOrderIds,
  assignableMembers,
  canAssign,
  canUpdateStatus,
  onClearSelection,
}: AssignToolbarProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedMember, setSelectedMember] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const hasSelection = selectedOrderIds.length > 0;

  const onAssign = async () => {
    if (!selectedMember) {
      toast.error("Please select a team member");
      return;
    }
    setLoading(true);
    try {
      await axios.post(`/api/${storeId}/orders/assign`, {
        orderIds: selectedOrderIds,
        assignToMemberId: selectedMember,
      });
      toast.success(`Assigned ${selectedOrderIds.length} orders`);
      onClearSelection();
      router.refresh();
      setSelectedMember("");
    } catch (error: any) {
      toast.error(error?.response?.data || "Failed to assign orders");
    } finally {
      setLoading(false);
    }
  };

  const onUpdateStatus = async () => {
    if (!selectedStatus) {
      toast.error("Please select a status");
      return;
    }
    setLoading(true);
    try {
      await axios.post(`/api/${storeId}/orders/bulk-action`, {
        orderIds: selectedOrderIds,
        action: "updateStatus",
        status: selectedStatus,
      });
      toast.success(`Updated status for ${selectedOrderIds.length} orders`);
      onClearSelection();
      router.refresh();
      setSelectedStatus("");
    } catch (error: any) {
      toast.error(error?.response?.data || "Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  if (!hasSelection) return null;

  return (
    <div className="bg-muted/50 border rounded-lg p-3 flex flex-wrap items-center gap-4 mb-4">
      <div className="flex items-center gap-2 mr-auto">
        <CheckSquare className="h-5 w-5 text-primary" />
        <span className="font-medium text-sm">
          {selectedOrderIds.length} order(s) selected
        </span>
        <Button variant="ghost" size="sm" onClick={onClearSelection} className="h-8 text-xs ml-2">
          Clear
        </Button>
      </div>

      {canAssign && assignableMembers.length > 0 && (
        <div className="flex items-center gap-2">
          <Select value={selectedMember} onValueChange={setSelectedMember}>
            <SelectTrigger className="w-[180px] h-9 bg-background">
              <SelectValue placeholder="Select assignee..." />
            </SelectTrigger>
            <SelectContent>
              {assignableMembers.map((member) => (
                <SelectItem key={member.id} value={member.id}>
                  <div className="flex items-center justify-between w-full pr-2 gap-2">
                    <span>{member.name}</span>
                    <Badge variant="outline" className="text-[10px] ml-2 font-normal py-0">
                      {member.roleName}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" className="h-9" onClick={onAssign} disabled={loading || !selectedMember}>
            <UserCheck className="h-4 w-4 mr-2" /> Assign
          </Button>
        </div>
      )}

      {canUpdateStatus && (
        <div className="flex items-center gap-2 pl-4 border-l">
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-[140px] h-9 bg-background">
              <SelectValue placeholder="Set status..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="dispatched">Dispatched</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" variant="secondary" className="h-9" onClick={onUpdateStatus} disabled={loading || !selectedStatus}>
            Update
          </Button>
        </div>
      )}
    </div>
  );
};
