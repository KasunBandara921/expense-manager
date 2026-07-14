import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ensureDefaultCategories } from "@/lib/categories/seed-defaults";
import { prisma } from "@/lib/db/prisma";
import { Header } from "@/components/layout/header";
import { CategoriesClient } from "@/components/categories/categories-client";

export const revalidate = 0;

export default async function CategoriesPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  // Make sure default categories exist
  await ensureDefaultCategories(userId);

  // Fetch all user categories including their associated expenses
  const categories = await prisma.category.findMany({
    where: { userId },
    include: {
      expenses: true,
    },
    orderBy: { name: "asc" },
  });

  // Prepare categories data with calculated spent totals and budget metrics
  const serializedCategories = categories.map((cat) => {
    const spent = cat.expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
    return {
      id: cat.id,
      name: cat.name,
      color: cat.color,
      icon: cat.icon,
      budget: cat.budget ? Number(cat.budget) : null,
      spent,
    };
  });

  return (
    <div className="min-h-screen pb-12 bg-background text-foreground transition-colors duration-300">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-zinc-50">Category Budgets</h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
            Define monthly budget goals for each category and track your spending limits.
          </p>
        </div>

        <CategoriesClient initialCategories={serializedCategories} />
      </main>
    </div>
  );
}
