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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useOrigin } from "@/hooks/useOrigin";
import { zodResolver } from "@hookform/resolvers/zod";
import { Billboard, Category, Store } from "@prisma/client";
import axios from "axios";
import { Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import * as z from "zod";
interface CategoryFormProps {
  initialData: Category | null;
  billboards: Billboard[];
}

const FormSchema = z.object({
  name: z.string().min(1),
  billboardId: z.string().min(1),
});
type CategoryFormValues = z.infer<typeof FormSchema>;
const CategoryForm = ({ initialData, billboards }: CategoryFormProps) => {
  const origin = useOrigin();
  const router = useRouter();
  const params = useParams();
  const title = initialData ? "Edit category" : "Create category";
  const description = initialData ? "Edit a category" : "Add a new category";
  const toastMessage = initialData ? "Category Updated" : "Category Created";
  const action = initialData ? "Save changes" : "Create";

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: initialData || {
      name: "",
      billboardId: "",
    },
  });
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const onSubmit = async (data: CategoryFormValues) => {
    try {
      setLoading(true);
      if (initialData) {
        await axios.patch(
          `/api/${params.storeId}/categories/${params.categoryId}`,
          data
        );
      } else {
        await axios.post(`/api/${params.storeId}/categories`, data);
      }
      router.refresh();
      router.push(`/${params.storeId}/categories`);
      toast.success(toastMessage);
    } catch (error) {
      toast.error("Something Went Wrong");
    } finally {
      setLoading(false);
    }
  };
  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(
        `/api/${params.storeId}/categories/${params.categoryId}`
      );
      router.refresh();
      router.push(`/${params.storeId}/categories`);
      toast.success("Category deleted.");
    } catch (error) {
      toast.error(
        "Make sure you removed all products using this category first"
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
                        placeholder="Category Name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
            <FormField
              name="billboardId"
              control={form.control}
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>Billboard:</FormLabel>
                    <Select
                      disabled={loading}
                      onValueChange={field.onChange}
                      value={field.value}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            defaultValue={field.value}
                            placeholder={"Select a billboard"}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {billboards.map((billboard) => (
                          <SelectItem key={billboard.id} value={billboard.id}>
                            {billboard.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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

export default CategoryForm;
