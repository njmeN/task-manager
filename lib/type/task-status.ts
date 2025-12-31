export const TaskStatus = {
    IN_PROGRESS: "IN_PROGRESS",
    COMPLETED: "COMPLETED",
    INCOMPLETE: "INCOMPLETE",
  } as const;
  
  export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus];