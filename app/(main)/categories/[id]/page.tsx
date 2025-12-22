// app/(protected)/categories/[id]/page.tsx
import { TaskList } from "@/components/task/TaskList";
import  prisma  from "@/lib/prisma";
import { getServerSession } from "@/lib/get-session";
import { notFound, redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const session = await getServerSession();

  if (!session?.user) return { title: "Category" };

  const category = await prisma.category.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
  });

  return {
    title: category ? category.name : "Category",
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { id } = await params;
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/sign-in");
  }

  // Verify category ownership
  const category = await prisma.category.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
  });

  if (!category) {
    notFound();
  }

  return (
    <div>
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div
            className="w-4 h-4 rounded"
            style={{ backgroundColor: category.color || "#e5e7eb" }}
          />
          <h1 className="text-2xl font-bold">{category.name}</h1>
        </div>
      </div>
      <TaskList categoryId={category.id} />

    </div>
  );
}