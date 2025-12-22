"use client";
import AlertModal from "@/components/modals/alertModal";
import { ApiAlert } from "@/components/ui/apiAlert";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
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
import {
  Category,
  Filter,
  FilterItem,
  Image,
  Product,
  ProductOnFilterItem,
  Store,
} from "@prisma/client";
import axios from "axios";
import { url } from "inspector";
import { Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import * as z from "zod";
import { Checkbox } from "@/components/ui/checkbox";
// import { getFilters } from "@/actions/getFilters";
interface ProductFormProps {
  initialData:
    | (Product & {
        images: Image[];
        filterItems: ProductOnFilterItem[];
      })
    | null;
  categories: Category[];
  filters: (Filter & { filterItems: FilterItem[] })[];
}

const FormSchema = z.object({
  name: z.string().min(1),
  images: z.object({ url: z.string() }).array(),
  price: z.coerce.number().min(1),
  inventory: z.coerce.number().min(0),
  categoryId: z.string().min(1),
  filterItemIds: z.string().array(),
  isFeatured: z.boolean().default(false).optional(),
  isArchived: z.boolean().default(false).optional(),
});
type ProductFormValues = z.infer<typeof FormSchema>;
const ProductForm = ({
  initialData,
  categories,
  filters,
}: ProductFormProps) => {
  const origin = useOrigin();
  const router = useRouter();
  const params = useParams();
  const title = initialData ? "Edit product" : "Create product";
  const description = initialData ? "Edit a product" : "Add a new product";
  const toastMessage = initialData ? "Product Updated" : "Product Created";
  const action = initialData ? "Save changes" : "Create";

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          filterItemIds: initialData.filterItems.map(
            (filter) => filter.filterItemId
          ),
          price: parseFloat(String(initialData?.price)),
          inventory: parseInt(String(initialData?.inventory)),
        }
      : {
          name: "",
          images: [],
          price: 0,
          inventory: 0,
          categoryId: "",
          isFeatured: false,
          isArchived: false,
          filterItemIds: [],
        },
  });
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const onSubmit = async (data: ProductFormValues) => {
    try {
      setLoading(true);
      if (initialData) {
        await axios.patch(
          `/api/${params.storeId}/products/${params.productId}`,
          data
        );
      } else {
        await axios.post(`/api/${params.storeId}/products`, data);
      }
      router.refresh();
      router.push(`/${params.storeId}/products`);
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
      await axios.delete(`/api/${params.storeId}/products/${params.productId}`);
      router.refresh();
      router.push(`/${params.storeId}/products`);
      toast.success("Product deleted.");
    } catch (error) {
      toast.error(
        "Make sure you removed all categories using this product first"
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
          <FormField
            name="images"
            control={form.control}
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Images:</FormLabel>
                  <FormControl>
                    <ImageUpload
                      value={field.value.map((image) => image.url)}
                      disabled={loading}
                      onChange={(url) =>
                        field.onChange([...field.value, { url }])
                      }
                      onRemove={(url) =>
                        field.onChange([
                          ...field.value.filter((image) => image.url !== url),
                        ])
                      }
                      onEnhance={async (url) => {
                        try {
                          setLoading(true);
                          const selectedCategoryId = form.getValues("categoryId");
                          const categoryName = categories.find(
                            (c) => c.id === selectedCategoryId
                          )?.name;
                          
                          const prompt = categoryName
                            ? `product photography of a ${categoryName}, professional studio lighting, 4k`
                            : undefined;

                          console.log("Enhancing image with params:", params);
                          const response = await axios.post(
                            `/api/${params.storeId}/ai-enhance`,
                            {
                              imageUrl: url,
                              prompt,
                            },
                          );

                          // Add the new image to the list
                          field.onChange([...field.value, { url: response.data.url }]);
                          toast.success("Image enhanced successfully!");
                        } catch (error: any) {
                          console.error("Enhance error:", error);
                          toast.error(`Failed: ${error.response?.data || error.message}`);
                        } finally {
                          setLoading(false);
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
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
                        placeholder="Product Name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
            <FormField
              name="price"
              control={form.control}
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>Price:</FormLabel>
                    <FormControl>
                      <Input disabled={loading} placeholder="999" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
            <FormField
              name="inventory"
              control={form.control}
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>Inventory:</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        disabled={loading}
                        placeholder="0"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
            <FormField
              name="categoryId"
              control={form.control}
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>Category:</FormLabel>
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
                            placeholder={"Select a category"}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <FormField
              name="filterItemIds"
              control={form.control}
              render={({ field, fieldState, formState }) => {
                if (filters.length === 0) {
                  return <></>;
                }
                return (
                  <>
                    {filters.map((filter, index) => (
                      <FormItem>
                        <FormLabel>{filter.name}:</FormLabel>
                        <Select
                          disabled={loading}
                          onValueChange={(value) => {
                            const current = field.value || [];
                            const newValues = [...current];
                            newValues[index] = value;
                            field.onChange(newValues);
                          }}
                          value={field.value[index]}
                          defaultValue={field.value[index]}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                defaultValue={field.value[index]}
                                placeholder={`Select a  ${filter.name}`}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {filter.filterItems.map((size) => (
                              <SelectItem key={size.id} value={size.id}>
                                {size.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    ))}
                  </>
                );
              }}
            />
            <FormField
              name="isArchived"
              control={form.control}
              render={({ field }) => {
                return (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4 border">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Archived</FormLabel>
                      <FormDescription>
                        This product will not appear anywhere in the store
                      </FormDescription>
                    </div>
                  </FormItem>
                );
              }}
            />
            <FormField
              name="isFeatured"
              control={form.control}
              render={({ field }) => {
                return (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4 border">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Featured</FormLabel>
                      <FormDescription>
                        This product will appear on home page
                      </FormDescription>
                    </div>
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

export default ProductForm;
