"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCategorySchema, CreateCategoryInput } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCreateCategory } from "@/lib/hook/useCategories"; 
// ** 1. وارد کردن تابع toast از Sonner **
import { toast } from "sonner"; 

const COLORS = [
  "#fecaca",
  "#bfdbfe",
  "#bbf7d0",
  "#fde68a",
  "#e9d5ff",
  "#fbcfe8",
];

export function CreateCategoryForm({
  onClose,
}: {
  onClose: () => void;
}) {
  const form = useForm<CreateCategoryInput>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      name: "",
      color: "",
    },
  });

  const { register, handleSubmit, setValue, watch } = form;
  const selectedColor = watch("color");

  const { mutate, isPending } = useCreateCategory(); 

  const onSubmit = (data: CreateCategoryInput) => {
  
    mutate(data, {
      onSuccess: (newCategory) => {
   
        toast.success(`Category "${newCategory.name}" created successfully!`); 
        onClose(); 
      },
      onError: (error) => {
      
        toast.error(`Failed to create category: ${error.message}`); 
        console.error("Error creating category:", error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="text-sm font-medium ">Category name</label>
        <input
          {...register("name")}
          className="w-full border rounded p-2 mt-2"
          disabled={isPending} 
        />
      </div>

      <div>
        <div className="text-sm mb-1">Pick a color</div>
        <div className="flex gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setValue("color", c)}
              className={cn(
                "h-8 w-8 rounded-full border-2",
                selectedColor === c && "ring-2 ring-black"
              )}
              style={{ backgroundColor: c }}
              disabled={isPending} 
            />
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            disabled={isPending}
        >
          Cancel
        </Button>
        <Button 
            type="submit"
            disabled={isPending} 
        >
          {isPending ? "Creating..." : "Create"}
        </Button>
      </div>
    </form>
  );
}