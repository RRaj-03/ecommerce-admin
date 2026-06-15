"use client";
import AlertModal from "@/components/modals/alertModal";
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
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { zodResolver } from "@hookform/resolvers/zod";
import { Page } from "@/generated/prisma/client";
import axios from "axios";
import { Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import * as z from "zod";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

interface PageFormProps {
  initialData: Page | null;
}

const FormSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  content: z.string().min(1),
  isPublished: z.boolean().default(false).optional(),
});
type PageFormValues = z.infer<typeof FormSchema>;

const PageForm = ({ initialData }: PageFormProps) => {
  const router = useRouter();
  const params = useParams();
  const form = useForm<PageFormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: initialData || {
      title: "",
      slug: "",
      content: "",
      isPublished: true,
    },
  });

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const title = initialData ? "Edit Page" : "Create Page";
  const desc = initialData ? "Edit a custom page" : "Add a new custom page";
  const toastMessage = initialData ? "Page Updated" : "Page Created";
  const action = initialData ? "Save Changes" : "Create";

  const onSubmit = async (data: PageFormValues) => {
    try {
      setLoading(true);
      if (initialData) {
        await axios.patch(`/api/${params.storeId}/pages/${params.pageId}`, data);
      } else {
        await axios.post(`/api/${params.storeId}/pages`, data);
      }
      router.refresh();
      router.push(`/${params.storeId}/pages`);
      toast.success(toastMessage);
    } catch (error: any) {
      toast.error(error?.response?.data || "Something Went Wrong");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/${params.storeId}/pages/${params.pageId}`);
      router.refresh();
      router.push(`/${params.storeId}/pages`);
      toast.success("Page deleted.");
    } catch (error) {
      toast.error("Make sure you removed all related data first");
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
        onConfirm={onDelete}
        loading={loading}
      />
      <div className="flex items-center justify-between">
        <Heading title={title} desc={desc} />
        {initialData && (
          <Button
            variant="destructive"
            size="icon"
            disabled={loading}
            onClick={() => setOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Separator />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
          <div className="grid grid-cols-2 gap-8">
            <FormField
              name="title"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="Page Title (e.g. Privacy Policy)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="slug"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL Slug</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="privacy-policy" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            name="content"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content</FormLabel>
                <FormControl>
                  <Textarea disabled={loading} placeholder="Page content..." rows={10} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="isPublished"
            control={form.control}
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Published</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    This page will appear on the storefront.
                  </p>
                </div>
              </FormItem>
            )}
          />
          <Button disabled={loading} type="submit" className="ml-auto">
            {action}
          </Button>
        </form>
      </Form>
    </>
  );
};

export default PageForm;
