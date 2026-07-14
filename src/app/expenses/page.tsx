import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { ensureDefaultCategories } from "@/lib/categories/seed-defaults";
import { Header } from "@/components/layout/header";
import { ExpensesClient } from "@/components/expenses/expenses-client";

export const revalidate = 0;

export default async function ExpensesPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  // Ensure default categories are seeded and fetch them
  const categories = await ensureDefaultCategories(userId);

  // Fetch all user expenses with their category details
  const expenses = await prisma.expense.findMany({
    where: { userId },
    include: { category: true },
    orderBy: { date: "desc" },
  });

  // Map Decimal or Date fields into plain serializable types for Client Component
  const serializedExpenses = expenses.map((exp) => ({
    ...exp,
    amount: Number(exp.amount),
    date: exp.date.toISOString(),
    createdAt: exp.createdAt.toISOString(),
    updatedAt: exp.updatedAt.toISOString(),
    category: {
      id: exp.category.id,
      name: exp.category.name,
      color: exp.category.color,
      icon: exp.category.icon,
    },
  }));

  const serializedCategories = categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    color: cat.color,
    icon: cat.icon,
  }));

  return (
    <div className="min-h-screen pb-12 bg-background text-foreground transition-colors duration-300">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-zinc-50">Expense History</h1>
            <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
              Browse, search, filter, and manage your logged spending.
            </p>
          </div>
        </div>

        <ExpensesClient
          initialExpenses={serializedExpenses}
          categories={serializedCategories}
        />
      </main>
    </div>
  );
}
