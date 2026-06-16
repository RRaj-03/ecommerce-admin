"use client";

import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Trash, Crown, UserPlus, Mail, Users, ArrowRight, Circle } from "lucide-react";
import Heading from "@/components/ui/heading";

interface Member {
  id: string;
  isAvailable: boolean;
  managerId: string | null;
  user: { id: string; name: string; email: string };
  role: { id: string; name: string; level: number };
  manager: { user: { name: string } } | null;
  subordinates: { user: { name: string } }[];
}

interface RoleOption {
  id: string;
  name: string;
  level: number;
}

interface Invite {
  id: string;
  email: string;
  status: string;
  role: { id: string; name: string };
  expiresAt: string | Date;
}

interface TeamClientProps {
  members: Member[];
  roles: RoleOption[];
  owner: { id: string; name: string; email: string } | null;
  invites: Invite[];
  isOwner: boolean;
  storeId: string;
}

export function TeamClient({
  members: initialMembers,
  roles,
  owner,
  invites: initialInvites,
  isOwner,
  storeId,
}: TeamClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState(initialMembers);
  const [invites, setInvites] = useState(initialInvites);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRoleId, setInviteRoleId] = useState("");

  const inviteMember = async () => {
    if (!inviteEmail.trim()) { toast.error("Email is required"); return; }
    if (!inviteRoleId) { toast.error("Please select a role"); return; }
    setLoading(true);
    try {
      const res = await axios.post(`/api/${storeId}/members`, {
        email: inviteEmail,
        roleId: inviteRoleId,
      });
      if (res.data.type === "member_added") {
        toast.success("Member added successfully");
      } else {
        toast.success(`Invite sent to ${inviteEmail}`);
      }
      setInviteEmail("");
      setInviteRoleId("");
      router.refresh();
    } catch (error: any) {
      toast.error(error?.response?.data || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const removeMember = async (memberId: string) => {
    setLoading(true);
    try {
      await axios.delete(`/api/${storeId}/members/${memberId}`);
      setMembers(members.filter((m) => m.id !== memberId));
      toast.success("Member removed");
    } catch (error: any) {
      toast.error(error?.response?.data || "Cannot remove member");
    } finally {
      setLoading(false);
    }
  };

  const updateMemberRole = async (memberId: string, roleId: string) => {
    setLoading(true);
    try {
      await axios.patch(`/api/${storeId}/members/${memberId}`, { roleId });
      router.refresh();
      toast.success("Role updated");
    } catch (error: any) {
      toast.error(error?.response?.data || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const updateMemberManager = async (memberId: string, managerId: string | null) => {
    setLoading(true);
    try {
      await axios.patch(`/api/${storeId}/members/${memberId}`, {
        managerId: managerId === "none" ? null : managerId,
      });
      router.refresh();
      toast.success("Manager updated");
    } catch (error: any) {
      toast.error(error?.response?.data || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async (memberId: string, isAvailable: boolean) => {
    try {
      await axios.patch(`/api/${storeId}/members/${memberId}`, { isAvailable });
      setMembers(members.map((m) =>
        m.id === memberId ? { ...m, isAvailable } : m
      ));
    } catch (error: any) {
      toast.error("Failed to update availability");
    }
  };

  return (
    <div className="space-y-6">
      <Heading title="Team Members" desc="Manage your team hierarchy and availability" />
      <Separator />

      {/* Owner Card */}
      {owner && (
        <Card>
          <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 py-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Crown className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-medium">{owner.name}</div>
                <div className="text-sm text-muted-foreground">{owner.email}</div>
              </div>
            </div>
            <Badge className="bg-primary text-primary-foreground">Owner</Badge>
          </CardContent>
        </Card>
      )}

      {/* Members */}
      <div className="grid gap-3">
        {members.map((member) => (
          <Card key={member.id}>
            <CardContent className="py-4">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                {/* Left: avatar + info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center font-bold text-sm">
                      {member.user.name.charAt(0).toUpperCase()}
                    </div>
                    <Circle
                      className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 ${
                        member.isAvailable
                          ? "text-green-500 fill-green-500"
                          : "text-gray-400 fill-gray-400"
                      }`}
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium truncate">{member.user.name}</div>
                    <div className="text-sm text-muted-foreground truncate">{member.user.email}</div>
                    {member.manager && (
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <ArrowRight className="h-3 w-3" /> Reports to {member.manager.user.name}
                      </div>
                    )}
                    {member.subordinates.length > 0 && (
                      <div className="text-xs text-muted-foreground mt-0.5">
                        <Users className="h-3 w-3 inline mr-1" />
                        {member.subordinates.length} subordinate(s)
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: controls */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Availability toggle */}
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-muted-foreground">
                      {member.isAvailable ? "On Duty" : "Off Duty"}
                    </Label>
                    <Switch
                      checked={member.isAvailable}
                      onCheckedChange={(val) => toggleAvailability(member.id, val)}
                      disabled={!isOwner}
                    />
                  </div>

                  {/* Role selector */}
                  {isOwner ? (
                    <Select
                      value={member.role.id}
                      onValueChange={(roleId) => updateMemberRole(member.id, roleId)}
                    >
                      <SelectTrigger className="w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge variant="outline">{member.role.name}</Badge>
                  )}

                  {/* Manager selector */}
                  {isOwner && (
                    <Select
                      value={member.managerId || "none"}
                      onValueChange={(val) => updateMemberManager(member.id, val)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="No manager" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Manager</SelectItem>
                        {members
                          .filter((m) => m.id !== member.id && m.role.level < member.role.level)
                          .map((m) => (
                            <SelectItem key={m.id} value={m.id}>
                              {m.user.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  )}

                  {/* Remove */}
                  {isOwner && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive shrink-0"
                      onClick={() => removeMember(member.id)}
                      disabled={loading}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {members.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No team members yet. Invite someone below.
          </p>
        )}
      </div>

      {/* Pending Invites */}
      {invites.length > 0 && (
        <>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Mail className="h-5 w-5" /> Pending Invites
          </h3>
          <div className="grid gap-2">
            {invites.map((invite) => (
              <Card key={invite.id}>
                <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                      <Mail className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">{invite.email}</div>
                      <div className="text-xs text-muted-foreground">
                        Expires: {new Date(invite.expiresAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline">{invite.role.name}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      <Separator />

      {/* Invite Form */}
      {isOwner && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserPlus className="h-5 w-5" /> Invite Team Member
            </CardTitle>
            <CardDescription>
              Enter their email. Existing users are added instantly. New users receive an invite.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3 items-end">
              <div className="flex-1 space-y-2 w-full">
                <Label>Email Address</Label>
                <Input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="team@example.com"
                  disabled={loading}
                />
              </div>
              <div className="w-full sm:w-48 space-y-2">
                <Label>Role</Label>
                <Select value={inviteRoleId} onValueChange={setInviteRoleId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role..." />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={inviteMember} disabled={loading} className="w-full sm:w-auto">
                <Mail className="h-4 w-4 mr-2" /> Invite
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
