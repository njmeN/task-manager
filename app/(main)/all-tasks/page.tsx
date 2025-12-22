// app/(protected)/tasks/page.tsx
import { AddCategoryButton } from "@/components/add-category-button";
import { TaskList } from "@/components/task/TaskList";

export default function AllTasksPage() {
  return (
    <div>
      <TaskList />
    </div>
  );
}