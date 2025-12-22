"use client";

import Link from "next/link";
import { useCategories, useDeleteCategory } from "@/lib/hook/useCategories"; 
import { CategoryWithCount } from "@/lib/type/api";
import { Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDeleteDialog } from "./confirm-delete-dialog";

export function CategoryList() {
  const { data: categories, isLoading, isError } = useCategories();
  const [categoryToDeleteId, setCategoryToDeleteId] = useState<string | null>(null);
  const deleteCategory = useDeleteCategory()

  if (isLoading) {
   
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !categories) {
   
    return <p className="p-3 text-sm text-red-500">Failed to load categories.</p>;
  }
  

  if (categories.length === 0) {
      return <p className="p-3 text-sm text-muted-foreground">No categories yet.</p>;
  }


  const handleCategoryDelete = () => {
    if (!categoryToDeleteId) return;
  
    deleteCategory.mutate(categoryToDeleteId, {
      onSuccess: () => {
        toast.success("Category deleted");
        setCategoryToDeleteId(null);
      },
      onError: (error) => {
        toast.error(error.message || "Failed to delete category");
      },
    });
  };

  return (
    <nav className="flex flex-col gap-1">
      {categories.map((category: CategoryWithCount) => (
        <div className="flex justify-between items-center gap-2 p-3 rounded hover:bg-accent group ">
            <Link
          key={category.id}
            href={`/categories/${category.id}`}
            className="flex items-center gap-2 p-3 rounded hover:bg-accent group "
        >
          <div
            className="w-4 h-4 rounded shrink-0"
            style={{ backgroundColor: category.color || "#e5e7eb" }}
          />
          <span className="flex-1 truncate text-sm">
            {category.name}
          </span>
          <span className="text-xs text-muted-foreground">
            {category._count.tasks}
          </span>
          </Link>
          <button onClick={() => setCategoryToDeleteId(category.id)}>
          <Trash2 className="h-3.5 w-3.5 mr-1 text-red-500 cursor-pointer" />
      </button>
      
      <ConfirmDeleteDialog
        open={!!categoryToDeleteId}
        onOpenChange={(o) => !o && setCategoryToDeleteId(null)}
        title="Are you sure you want to delete this category?"
        description="All tasks in this category would be deleted."
        onConfirm={handleCategoryDelete}
        isLoading={deleteCategory.isPending}
      />
        </div>
      
   
      ))}
    </nav>
  );
}