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
import { Color, Store } from "@prisma/client";
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
interface ColorFormProps {
  initialData: Color | null;
}

const FormSchema = z.object({
  name: z.string().min(1),
  value: z.string().min(1).regex(/^#/, {
    message: "String must be valid hex code",
  }),
});
type ColorFormValues = z.infer<typeof FormSchema>;
const ColorForm = ({ initialData }: ColorFormProps) => {
  const origin = useOrigin();
  const router = useRouter();
  const params = useParams();
  const title = initialData ? "Edit color" : "Create color";
  const description = initialData ? "Edit a color" : "Add a new color";
  const toastMessage = initialData ? "Color Updated" : "Color Created";
  const action = initialData ? "Save changes" : "Create";

  const form = useForm<ColorFormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: initialData || {
      name: "",
      value: "",
    },
  });
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const onSubmit = async (data: ColorFormValues) => {
    try {
      setLoading(true);
      if (initialData) {
        await axios.patch(
          `/api/${params.storeId}/colors/${params.colorId}`,
          data
        );
      } else {
        await axios.post(`/api/${params.storeId}/colors`, data);
      }
      router.refresh();
      router.push(`/${params.storeId}/colors`);
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
      await axios.delete(`/api/${params.storeId}/colors/${params.colorId}`);
      router.refresh();
      router.push(`/${params.storeId}/colors`);
      toast.success("Color deleted.");
    } catch (error) {
      toast.error("Make sure you removed all products using this color first");
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
                        placeholder="Color Name"
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
                      <div className="flex items-center gap-x-4">
                        <Input
                          disabled={loading}
                          placeholder="Color value"
                          {...field}
                        />
                        <div
                          className="rounded-full border-black border-2 border-dotted p-4"
                          style={{ backgroundColor: field.value }}
                        ></div>
                      </div>
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

export default ColorForm;
