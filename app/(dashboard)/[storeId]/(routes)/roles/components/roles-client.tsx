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
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash, Plus, Shield, Users, Mail, Crown, UserPlus, Edit2, ChevronDown, ChevronUp } from "lucide-react";
import Heading from "@/components/ui/heading";
import {
  RESOURCES,
  RESOURCE_ACTIONS,
  RESOURCE_LABELS,
  ACTION_LABELS,
  SCOPE_LABELS,
  SCOPEABLE_RESOURCES,
  Resource,
  Action,
  Scope,
} from "@/lib/permissions";

interface Permission {
  id: string;
  resource: string;
  action: string;
  scope: string;
}

interface RoleWithPermissions {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  level: number;
  canDelegate: boolean;
  permissions: Permission[];
  _count: { members: number };
}

interface Member {
  id: string;
  user: { id: string; name: string; email: string };
  role: { id: string; name: string };
}

interface Invite {
  id: string;
  email: string;
  status: string;
  role: { id: string; name: string };
  expiresAt: string | Date;
}

interface RolesClientProps {
  roles: RoleWithPermissions[];
  members: Member[];
  owner: { id: string; name: string; email: string } | null;
  invites: Invite[];
  isOwner: boolean;
  storeId: string;
}

export function RolesClient({
  roles: initialRoles,
  members: initialMembers,
  owner,
  invites: initialInvites,
  isOwner,
  storeId,
}: RolesClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState(initialRoles);
  const [members, setMembers] = useState(initialMembers);
  const [invites, setInvites] = useState(initialInvites);

  // Role editing state
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [roleName, setRoleName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [rolePermissions, setRolePermissions] = useState<Set<string>>(new Set());
  const [roleLevel, setRoleLevel] = useState(100);
  const [roleCanDelegate, setRoleCanDelegate] = useState(false);
  const [permissionScopes, setPermissionScopes] = useState<Record<string, Scope>>({});
  const [isCreatingRole, setIsCreatingRole] = useState(false);

  // Invite state
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRoleId, setInviteRoleId] = useState("");

  // Collapsed roles state
  const [expandedRoles, setExpandedRoles] = useState<Set<string>>(new Set());

  const toggleRoleExpanded = (roleId: string) => {
    setExpandedRoles((prev) => {
      const next = new Set(prev);
      if (next.has(roleId)) next.delete(roleId);
      else next.add(roleId);
      return next;
    });
  };

  const togglePermission = (resource: string, action: string) => {
    const key = `${resource}:${action}`;
    setRolePermissions((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleResourceAll = (resource: Resource) => {
    const actions = RESOURCE_ACTIONS[resource];
    const allChecked = actions.every((a) => rolePermissions.has(`${resource}:${a}`));
    setRolePermissions((prev) => {
      const next = new Set(prev);
      actions.forEach((a) => {
        if (allChecked) next.delete(`${resource}:${a}`);
        else next.add(`${resource}:${a}`);
      });
      return next;
    });
  };

  const startEditRole = (role: RoleWithPermissions) => {
    setEditingRole(role.id);
    setRoleName(role.name);
    setRoleDescription(role.description || "");
    setRolePermissions(new Set(role.permissions.map((p) => `${p.resource}:${p.action}`)));
    setRoleLevel(role.level);
    setRoleCanDelegate(role.canDelegate);
    const scopes: Record<string, Scope> = {};
    role.permissions.forEach((p) => { scopes[`${p.resource}:${p.action}`] = p.scope as Scope; });
    setPermissionScopes(scopes);
    setIsCreatingRole(false);
  };

  const startCreateRole = () => {
    setEditingRole(null);
    setRoleName("");
    setRoleDescription("");
    setRolePermissions(new Set());
    setRoleLevel(100);
    setRoleCanDelegate(false);
    setPermissionScopes({});
    setIsCreatingRole(true);
  };

  const cancelEdit = () => {
    setEditingRole(null);
    setIsCreatingRole(false);
  };

  const saveRole = async () => {
    if (!roleName.trim()) {
      toast.error("Role name is required");
      return;
    }

    const permissions = Array.from(rolePermissions).map((key) => {
      const [resource, action] = key.split(":");
      return { resource, action, scope: permissionScopes[key] || "all" };
    });

    setLoading(true);
    try {
      if (isCreatingRole) {
        const res = await axios.post(`/api/${storeId}/roles`, {
          name: roleName,
          description: roleDescription,
          permissions,
          level: roleLevel,
          canDelegate: roleCanDelegate,
        });
        setRoles([...roles, { ...res.data, _count: { members: 0 } }]);
        toast.success("Role created");
      } else if (editingRole) {
        const res = await axios.patch(`/api/${storeId}/roles/${editingRole}`, {
          name: roleName,
          description: roleDescription,
          permissions,
          level: roleLevel,
          canDelegate: roleCanDelegate,
        });
        setRoles(roles.map((r) => (r.id === editingRole ? { ...res.data, _count: r._count } : r)));
        toast.success("Role updated");
      }
      cancelEdit();
    } catch (error: any) {
      toast.error(error?.response?.data || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const deleteRole = async (roleId: string) => {
    setLoading(true);
    try {
      await axios.delete(`/api/${storeId}/roles/${roleId}`);
      setRoles(roles.filter((r) => r.id !== roleId));
      toast.success("Role deleted");
    } catch (error: any) {
      toast.error(error?.response?.data || "Cannot delete role");
    } finally {
      setLoading(false);
    }
  };

  const seedDefaultRoles = async () => {
    setLoading(true);
    try {
      const res = await axios.put(`/api/${storeId}/roles`);
      router.refresh();
      toast.success("Default roles created");
    } catch (error: any) {
      toast.error(error?.response?.data || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const inviteMember = async () => {
    if (!inviteEmail.trim()) {
      toast.error("Email is required");
      return;
    }
    if (!inviteRoleId) {
      toast.error("Please select a role");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`/api/${storeId}/members`, {
        email: inviteEmail,
        roleId: inviteRoleId,
      });

      if (res.data.type === "member_added") {
        setMembers([...members, res.data.member]);
        toast.success("Member added successfully");
      } else {
        setInvites([res.data.invite, ...invites]);
        toast.success(`Invite sent to ${inviteEmail}. They need to register first.`);
      }

      setInviteEmail("");
      setInviteRoleId("");
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
      const res = await axios.patch(`/api/${storeId}/members/${memberId}`, { roleId });
      setMembers(members.map((m) => (m.id === memberId ? res.data : m)));
      toast.success("Role updated");
    } catch (error: any) {
      toast.error(error?.response?.data || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Permission Matrix Component
  const PermissionMatrix = () => (
    <div className="border rounded-lg overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted/50">
            <th className="text-left p-3 font-semibold">Resource</th>
            {(["view", "create", "update", "delete", "export", "assign"] as Action[]).map((action) => (
              <th key={action} className="text-center p-3 font-semibold w-20">
                {ACTION_LABELS[action]}
              </th>
            ))}
            <th className="text-center p-3 font-semibold w-28">Scope</th>
          </tr>
        </thead>
        <tbody>
          {RESOURCES.map((resource) => {
            const availableActions = RESOURCE_ACTIONS[resource];
            const allChecked = availableActions.every((a) =>
              rolePermissions.has(`${resource}:${a}`)
            );
            const isScopeable = SCOPEABLE_RESOURCES.includes(resource);
            return (
              <tr key={resource} className="border-t hover:bg-muted/30">
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={allChecked}
                      onCheckedChange={() => toggleResourceAll(resource)}
                    />
                    <span className="font-medium">{RESOURCE_LABELS[resource]}</span>
                  </div>
                </td>
                {(["view", "create", "update", "delete", "export", "assign"] as Action[]).map((action) => (
                  <td key={action} className="text-center p-3">
                    {availableActions.includes(action) ? (
                      <Checkbox
                        checked={rolePermissions.has(`${resource}:${action}`)}
                        onCheckedChange={() => togglePermission(resource, action)}
                      />
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                ))}
                <td className="text-center p-3">
                  {isScopeable ? (
                    <Select
                      value={permissionScopes[`${resource}:view`] || "all"}
                      onValueChange={(val) => {
                        const next = { ...permissionScopes };
                        availableActions.forEach((a) => {
                          next[`${resource}:${a}`] = val as Scope;
                        });
                        setPermissionScopes(next);
                      }}
                    >
                      <SelectTrigger className="h-8 w-28 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{SCOPE_LABELS.all}</SelectItem>
                        <SelectItem value="assigned">{SCOPE_LABELS.assigned}</SelectItem>
                        <SelectItem value="subordinates">{SCOPE_LABELS.subordinates}</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className="text-xs text-muted-foreground">Global</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-8">
      <Heading title="Roles & Team" desc="Manage roles, permissions, and team members" />
      <Separator />

      {/* ===== ROLES SECTION ===== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5" /> Roles ({roles.length})
          </h2>
          <div className="flex gap-2">
            {isOwner && roles.length === 0 && (
              <Button variant="outline" disabled={loading} onClick={seedDefaultRoles}>
                Seed Default Roles
              </Button>
            )}
            {isOwner && (
              <Button onClick={startCreateRole} disabled={loading}>
                <Plus className="h-4 w-4 mr-2" /> New Role
              </Button>
            )}
          </div>
        </div>

        {/* Role Cards */}
        <div className="grid gap-4">
          {roles.map((role) => (
            <Card key={role.id}>
              <CardHeader
                className="cursor-pointer"
                onClick={() => toggleRoleExpanded(role.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-base">{role.name}</CardTitle>
                    {role.isSystem && <Badge variant="secondary">System</Badge>}
                    <Badge variant="outline">{role._count.members} members</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    {isOwner && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditRole(role);
                          }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        {!role.isSystem && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteRole(role.id);
                            }}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        )}
                      </>
                    )}
                    {expandedRoles.has(role.id) ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </div>
                {role.description && (
                  <CardDescription>{role.description}</CardDescription>
                )}
              </CardHeader>
              {expandedRoles.has(role.id) && (
                <CardContent>
                  <div className="text-xs text-muted-foreground mb-2">Permissions:</div>
                  <div className="flex flex-wrap gap-1">
                    {role.permissions.map((p) => (
                      <Badge key={p.id} variant="outline" className="text-xs">
                        {p.resource}:{p.action}
                      </Badge>
                    ))}
                    {role.permissions.length === 0 && (
                      <span className="text-xs text-muted-foreground">No permissions assigned</span>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* ===== ROLE EDITOR MODAL ===== */}
      {(isCreatingRole || editingRole) && (
        <Card className="border-primary/50">
          <CardHeader>
            <CardTitle>{isCreatingRole ? "Create New Role" : `Edit Role: ${roleName}`}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Role Name</Label>
                <Input
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  placeholder="e.g., Content Editor"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={roleDescription}
                  onChange={(e) => setRoleDescription(e.target.value)}
                  placeholder="What this role can do..."
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label>Power Level <span className="text-xs text-muted-foreground">(lower = more powerful)</span></Label>
                <Input
                  type="number"
                  value={roleLevel}
                  onChange={(e) => setRoleLevel(parseInt(e.target.value) || 100)}
                  min={1}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label>Can Create Sub-Roles?</Label>
                <div className="flex items-center gap-2 h-10">
                  <Checkbox
                    checked={roleCanDelegate}
                    onCheckedChange={(val) => setRoleCanDelegate(!!val)}
                  />
                  <span className="text-sm text-muted-foreground">Yes, allow delegated role creation</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-base font-semibold">Permission Matrix</Label>
              <p className="text-xs text-muted-foreground">
                Check the row checkbox to toggle all actions for a resource.
              </p>
              <PermissionMatrix />
            </div>

            <div className="flex gap-2">
              <Button onClick={saveRole} disabled={loading}>
                {isCreatingRole ? "Create Role" : "Save Changes"}
              </Button>
              <Button variant="outline" onClick={cancelEdit} disabled={loading}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* ===== TEAM MEMBERS SECTION ===== */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Users className="h-5 w-5" /> Team Members
        </h2>

        {/* Owner */}
        {owner && (
          <Card>
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
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
        {members.map((member) => (
          <Card key={member.id}>
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center font-bold">
                  {member.user.name.charAt(0)}
                </div>
                <div>
                  <div className="font-medium">{member.user.name}</div>
                  <div className="text-sm text-muted-foreground">{member.user.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {isOwner ? (
                  <Select
                    value={member.role.id}
                    onValueChange={(roleId) => updateMemberRole(member.id, roleId)}
                  >
                    <SelectTrigger className="w-40">
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
                {isOwner && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => removeMember(member.id)}
                    disabled={loading}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                )}
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

      {/* ===== PENDING INVITES ===== */}
      {invites.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Mail className="h-5 w-5" /> Pending Invites
          </h3>
          {invites.map((invite) => (
            <Card key={invite.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <div className="font-medium">{invite.email}</div>
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
      )}

      <Separator />

      {/* ===== INVITE FORM ===== */}
      {isOwner && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" /> Invite Team Member
            </CardTitle>
            <CardDescription>
              Enter their email. If they already have an admin account, they'll be added immediately.
              Otherwise, an invite will be created for when they register.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div className="flex-1 space-y-2">
                <Label>Email Address</Label>
                <Input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="team@example.com"
                  disabled={loading}
                />
              </div>
              <div className="w-48 space-y-2">
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
              <Button onClick={inviteMember} disabled={loading}>
                <Mail className="h-4 w-4 mr-2" /> Invite
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
