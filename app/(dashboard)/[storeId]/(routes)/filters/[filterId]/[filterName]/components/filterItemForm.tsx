"use client";
import AlertModal from "@/components/modals/alertModal";
import { ApiAlert } from "@/components/ui/apiAlert";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Heading from "@/components/ui/heading";
import ImageUpload from "@/components/ui/imageUpload";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useOrigin } from "@/hooks/useOrigin";
import { zodResolver } from "@hookform/resolvers/zod";
import { FilterItem, Store } from "@prisma/client";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import axios from "axios";
import { Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import * as z from "zod";
interface FilterItemFormProps {
  initialData: FilterItem | null;
}

const FormSchema = z.object({
  name: z.string().min(1),
  value: z.string().min(1),
});
type FilterItemFormValues = z.infer<typeof FormSchema>;
const FilterItemForm = ({ initialData }: FilterItemFormProps) => {
  const origin = useOrigin();
  const router = useRouter();
  const params = useParams();
  const title = initialData
    ? `Edit ${params.filterName}`
    : `Create ${params.filterName}`;
  const description = initialData
    ? `Edit a ${params.filterName}`
    : `Add a new ${params.filterName}`;
  const toastMessage = initialData
    ? `FilterItem Updated`
    : `FilterItem Created`;
  const action = initialData ? `Save changes` : `Create`;

  const form = useForm<FilterItemFormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: initialData || {
      name: "",
      value: "",
    },
  });
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const onSubmit = async (data: FilterItemFormValues) => {
    try {
      setLoading(true);
      if (initialData) {
        await axios.patch(
          `/api/${params.storeId}/filters/${params.filterId}/filterItems/${params.filterItemId}`,
          data
        );
      } else {
        await axios.post(
          `/api/${params.storeId}/filters/${params.filterId}/filterItems`,
          data
        );
      }
      router.refresh();
      router.push(
        `/${params.storeId}/filters/${params.filterId}/${params.filterName}`
      );
      toast.success(toastMessage);
    } catch (error) {
      toast.error(`Something Went Wrong`);
    } finally {
      setLoading(false);
    }
  };
  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(
        `/api/${params.storeId}/filters/${params.filterId}/${params.filterName}/${params.filterItemId}`
      );
      router.refresh();
      router.push(`/${params.storeId}/${params.filterName}`);
      toast.success(`${params.filterName} deleted.`);
    } catch (error) {
      toast.error(
        `Make sure you removed all products using this ${params.filterName} first`
      );
    } finally {
      setOpen(false);
      setLoading(false);
    }
  };
  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={() => {}}
        loading={loading}
      />
      <div className="flex items-center justify-between">
        <Heading title={title} desc={description} />
        {initialData && (
          <Button
            variant={"destructive"}
            size={"icon"}
            disabled={loading}
            onClick={() => {
              onDelete();
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Separator />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 w-full"
        >
          <div className="grid grid-cols-3 gap-8">
            <FormField
              name="name"
              control={form.control}
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>Name:</FormLabel>
                    <FormControl>
                      <Input
                        disabled={loading}
                        placeholder={`${params.filterName} Name`}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
            <FormField
              name="value"
              control={form.control}
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>Value:</FormLabel>
                    <FormControl>
                      <Input
                        disabled={loading}
                        placeholder={`${params.filterName} value`}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          </div>
          <Button disabled={loading} type="submit" className="ml-auto">
            {action}
          </Button>
        </form>
      </Form>
    </>
  );
};

export default FilterItemForm;
