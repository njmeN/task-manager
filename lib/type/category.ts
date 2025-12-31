export interface Category {
    id: string;
    name: string;
    color: string | null;
    userId: string | null;
    isSystem: boolean;
    createdAt: Date | string;
  }