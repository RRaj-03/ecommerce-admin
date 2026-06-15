"use client";

import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { CreditCard, Smartphone, Truck, DollarSign } from "lucide-react";
import { PaymentConfig } from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";
import Heading from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface PaymentsFormProps {
  storeId: string;
  initialConfig: PaymentConfig | null;
}

const PaymentsForm = ({ storeId, initialConfig }: PaymentsFormProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [config, setConfig] = useState({
    stripeEnabled: initialConfig?.stripeEnabled ?? true,
    stripeKey: initialConfig?.stripeKey || "",
    phonepeEnabled: initialConfig?.phonepeEnabled ?? false,
    phonepeMerchantId: initialConfig?.phonepeMerchantId || "",
    phonepeSaltKey: initialConfig?.phonepeSaltKey || "",
    phonepeSaltIndex: initialConfig?.phonepeSaltIndex ?? 1,
    codEnabled: initialConfig?.codEnabled ?? false,
    codMinOrder: initialConfig?.codMinOrder ? Number(initialConfig.codMinOrder) : 0,
    codMaxOrder: initialConfig?.codMaxOrder ? Number(initialConfig.codMaxOrder) : 99999,
    currency: initialConfig?.currency || "INR",
    taxRate: initialConfig?.taxRate ? Number(initialConfig.taxRate) : 0,
  });

  const onSave = async () => {
    try {
      setLoading(true);
      await axios.patch(`/api/${storeId}/payment-config`, config);
      router.refresh();
      toast.success("Payment settings saved!");
    } catch (error) {
      toast.error("Failed to save payment settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading title="Payment Methods" desc="Configure how customers can pay" />
        <Button onClick={onSave} disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
      <Separator />

      <div className="space-y-8 max-w-3xl">
        {/* Stripe */}
        <div className={cn(
          "border rounded-xl p-6 space-y-4 transition-colors",
          config.stripeEnabled ? "border-primary/30 bg-primary/5" : "border-border"
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950">
                <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Stripe</h3>
                <p className="text-sm text-muted-foreground">Credit cards, debit cards, international payments</p>
              </div>
            </div>
            <Switch
              checked={config.stripeEnabled}
              onCheckedChange={(v) => setConfig(prev => ({ ...prev, stripeEnabled: v }))}
            />
          </div>
          {config.stripeEnabled && (
            <div className="space-y-3 pt-2">
              <div className="space-y-1">
                <Label className="text-xs">Stripe Secret Key</Label>
                <Input
                  type="password"
                  value={config.stripeKey}
                  onChange={(e) => setConfig(prev => ({ ...prev, stripeKey: e.target.value }))}
                  placeholder="sk_live_... (leave empty to use env variable)"
                  className="font-mono text-xs"
                />
                <p className="text-xs text-muted-foreground">
                  If left empty, the STRIPE_API_KEY environment variable will be used.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* PhonePe / UPI */}
        <div className={cn(
          "border rounded-xl p-6 space-y-4 transition-colors",
          config.phonepeEnabled ? "border-purple-400/30 bg-purple-50 dark:bg-purple-950/20" : "border-border"
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-950">
                <Smartphone className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">PhonePe / UPI</h3>
                <p className="text-sm text-muted-foreground">UPI payments, PhonePe wallet</p>
              </div>
            </div>
            <Switch
              checked={config.phonepeEnabled}
              onCheckedChange={(v) => setConfig(prev => ({ ...prev, phonepeEnabled: v }))}
            />
          </div>
          {config.phonepeEnabled && (
            <div className="space-y-3 pt-2">
              <div className="space-y-1">
                <Label className="text-xs">Client ID</Label>
                <Input
                  value={config.phonepeMerchantId}
                  onChange={(e) => setConfig(prev => ({ ...prev, phonepeMerchantId: e.target.value }))}
                  placeholder="Client ID from PhonePe dashboard"
                  className="font-mono text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Client Secret</Label>
                <Input
                  type="password"
                  value={config.phonepeSaltKey}
                  onChange={(e) => setConfig(prev => ({ ...prev, phonepeSaltKey: e.target.value }))}
                  placeholder="Client Secret from PhonePe dashboard"
                  className="font-mono text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Client Version</Label>
                <Input
                  type="number"
                  value={config.phonepeSaltIndex}
                  onChange={(e) => setConfig(prev => ({ ...prev, phonepeSaltIndex: parseInt(e.target.value) || 1 }))}
                  className="w-24"
                />
              </div>
            </div>
          )}
        </div>

        {/* Cash on Delivery */}
        <div className={cn(
          "border rounded-xl p-6 space-y-4 transition-colors",
          config.codEnabled ? "border-green-400/30 bg-green-50 dark:bg-green-950/20" : "border-border"
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-950">
                <Truck className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Cash on Delivery</h3>
                <p className="text-sm text-muted-foreground">Customers pay when the order is delivered</p>
              </div>
            </div>
            <Switch
              checked={config.codEnabled}
              onCheckedChange={(v) => setConfig(prev => ({ ...prev, codEnabled: v }))}
            />
          </div>
          {config.codEnabled && (
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <Label className="text-xs">Minimum Order (₹)</Label>
                <Input
                  type="number"
                  value={config.codMinOrder}
                  onChange={(e) => setConfig(prev => ({ ...prev, codMinOrder: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Maximum Order (₹)</Label>
                <Input
                  type="number"
                  value={config.codMaxOrder}
                  onChange={(e) => setConfig(prev => ({ ...prev, codMaxOrder: parseFloat(e.target.value) || 99999 }))}
                />
              </div>
            </div>
          )}
        </div>

        {/* General */}
        <Separator />
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <DollarSign className="w-5 h-5 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg">General</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs">Currency</Label>
              <Input
                value={config.currency}
                onChange={(e) => setConfig(prev => ({ ...prev, currency: e.target.value.toUpperCase() }))}
                placeholder="INR"
                className="w-24"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Tax Rate (%)</Label>
              <Input
                type="number"
                step="0.01"
                value={config.taxRate}
                onChange={(e) => setConfig(prev => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }))}
                className="w-24"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentsForm;
