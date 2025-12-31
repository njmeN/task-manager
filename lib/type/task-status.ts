export const TaskStatus = {
    IN_PROGRESS: "IN_PROGRESS",
    COMPLETED: "COMPLETED",
    INCOMPLETE: "INCOMPLETE",
  } as const;
  
export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus];
  

export interface Task {
    id: string;
    title: string;
    description: string | null;
    status: TaskStatus;
    dueDate: Date | string | null;
    categoryId: string | null;
    userId: string;
    createdAt: Date | string;
    updatedAt: Date | string;
}
  
