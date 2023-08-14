"use client";

import React, { useState } from "react";
import Modal from "@/components/ui/modal";
import { useModalStore } from "@/hooks/useModalStore";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import axios from "axios";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { toast } from "react-hot-toast";
const FormSchema = z.object({
  name: z.string().min(1),
});

const StoreModal = () => {
  const modalStore = useModalStore();
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    try {
      setIsLoading(true);
      const response = await axios.post("/api/stores", values);
      console.log(response.data);
      window.location.assign(`${response.data.id}`);
    } catch (error) {
      toast.error("Sommething Went Wrong");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Modal
      title="Create Store"
      description="Add a new store to manage products and categories"
      isOpen={modalStore.isOpen}
      onClose={modalStore.onClose}
    >
      <div>
        <div className="space-y-4 py-2 pb-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>Name:</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="E-Commerce"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              <div className="pt-6 space-x-2 flex items-center justify-end w-full">
                <Button
                  variant={"outline"}
                  onClick={modalStore.onClose}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  Continue
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </Modal>
  );
};

export default StoreModal;
