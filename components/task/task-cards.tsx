"use client";

import { TaskWithCategory } from "@/lib/type/api";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Edit, Trash2, Loader2, AlertCircle, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { TaskStatus } from "@/lib/type/task-status";



interface TaskCardProps {
  task: TaskWithCategory;
  onEdit: (task: TaskWithCategory) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (task: TaskWithCategory) => void;
  isUpdating?: boolean;
}

export function TaskCard({
  task,
  onEdit,
  onDelete,
  onToggleStatus,
  isUpdating,
}: TaskCardProps) {
  const isCompleted = task.status === TaskStatus.COMPLETED;
  const isIncomplete = task.status === TaskStatus.INCOMPLETE;

  return (
    <Card
      className={cn(
        "shadow-sm transition-all hover:shadow-md border-l-4",
        isCompleted && "bg-muted/40 opacity-90 border-l-green-500",
        isIncomplete && "bg-red-50/40 border-l-red-500 border-red-100",
        !isCompleted && !isIncomplete && "border-l-blue-500"
      )}
    >
      <CardHeader className="flex flex-row justify-between items-start pb-2">
        <div className="space-y-1 flex-1">
          <CardTitle
            className={cn(
              "text-lg font-semibold leading-tight",
              isCompleted && "line-through text-muted-foreground",
              isIncomplete && "text-red-700"
            )}
          >
            {task.title}
          </CardTitle>
          
          {isIncomplete && (
            <div className="flex items-center text-[10px] font-bold uppercase text-red-600 tracking-wider">
              <AlertCircle className="h-3.5 w-3.5 mr-1" /> Overdue
            </div>
          )}
        </div>

        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 cursor-pointer shrink-0"
          onClick={() => onToggleStatus(task)}
          disabled={isUpdating}
        >
          {isUpdating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle
              className={cn(
                "h-5 w-5 transition-colors",
                isCompleted
                  ? "text-green-600"
                  : isIncomplete 
                    ? "text-red-400 hover:text-red-600"
                    : "text-muted-foreground hover:text-primary"
              )}
            />
          )}
        </Button>
      </CardHeader>

      <CardContent className="pb-4">
        {task.description && (
          <p className={cn(
            "text-sm line-clamp-2 mb-3",
            isCompleted ? "text-muted-foreground/70" : "text-muted-foreground"
          )}>
            {task.description}
          </p>
        )}
        
        <div className={cn(
          "flex items-center text-xs px-2 py-1 rounded-md w-fit",
          isIncomplete ? "bg-red-100 text-red-700 font-semibold" : "bg-muted/50 text-muted-foreground"
        )}>
          <Calendar className="h-3 w-3 mr-1.5" />
          <span className="font-medium mr-1">Due:</span>
          <span>
            {task.dueDate
              ? new Date(task.dueDate).toLocaleString([], {
                  dateStyle: "medium",
                  timeStyle: "short",
                })
              : "No deadline"}
          </span>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between items-center pt-2 border-t bg-muted/5">
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 px-2 cursor-pointer"
            onClick={() => onEdit(task)}
          >
            <Edit className="h-3.5 w-3.5 mr-1" /> Edit
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
            onClick={() => onDelete(task.id)}
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
          </Button>
        </div>

        {task.category && (
          <span
            className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase text-white shadow-sm"
            style={{ backgroundColor: task.category.color ?? "#94a3b8" }}
          >
            {task.category.name}
          </span>
        )}
      </CardFooter>
    </Card>
  );
}