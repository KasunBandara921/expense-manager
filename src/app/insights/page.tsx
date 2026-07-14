import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { Header } from "@/components/layout/header";
import { InsightsClient } from "@/components/insights/insights-client";

export const revalidate = 0;

export default async function InsightsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  // Fetch user expenses to pass for local statistics
  const expenses = await prisma.expense.findMany({
    where: { userId },
    include: {
      category: true,
    },
    orderBy: { date: "desc" },
  });

  // Serialize Decimal and Date fields
  const serializedExpenses = expenses.map((exp) => ({
    id: exp.id,
    amount: Number(exp.amount),
    description: exp.description,
    date: exp.date.toISOString(),
    categoryId: exp.categoryId,
    category: {
      id: exp.category.id,
      name: exp.category.name,
      color: exp.category.color,
      icon: exp.category.icon,
      budget: exp.category.budget ? Number(exp.category.budget) : null,
    },
  }));

  const hasExpenses = expenses.length > 0;

  return (
    <div className="min-h-screen pb-12 bg-background text-foreground transition-colors duration-300">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-zinc-50 flex items-center gap-2">
            AI Insights & Recommendations
          </h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
            Get personalized rules, saving tips, and immediate warnings calculated from your recent ledger records.
          </p>
        </div>

        <InsightsClient expenses={serializedExpenses} hasExpenses={hasExpenses} />
      </main>
    </div>
  );
}
