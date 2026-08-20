import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ExpenseCharts } from "@/components/dashboard/expense-charts";
import { DailyExpensesChart } from "@/components/dashboard/daily-expenses-chart";
import { DeleteExpenseButton } from "@/components/dashboard/delete-expense-button";
import { Header } from "@/components/layout/header";
import { Sparkles } from "lucide-react";
import {
  buildCategoryChartData,
  buildMonthlyChartData,
  buildDailyChartData,
} from "@/lib/dashboard/chart-data";
import { subMonths, startOfMonth } from "date-fns";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const userId = session.user.id;

  const sixMonthsAgo = startOfMonth(subMonths(new Date(), 5));

  const allExpenses = await prisma.expense.findMany({
    where: { userId },
    include: { category: true },
    orderBy: { date: "desc" },
  });

  const expenses = allExpenses.slice(0, 5);
  const expenseCount = allExpenses.length;
  const totalAmount = allExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const categoryData = buildCategoryChartData(allExpenses);
  const monthlyData = buildMonthlyChartData(
    allExpenses.filter((expense) => expense.date >= sixMonthsAgo)
  );
  const dailyData = buildDailyChartData(allExpenses);

  return (
    <div className="min-h-screen pb-12 bg-background text-foreground transition-colors duration-300">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Welcome back, {session.user.name}!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Rs. {totalAmount.toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Number of Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{expenseCount}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Average Expense
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Rs.{" "}
                {expenseCount > 0
                  ? (totalAmount / expenseCount).toFixed(2)
                  : "0.00"}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8 border-violet-200/80 dark:border-violet-800/40 bg-gradient-to-br from-violet-50/60 to-indigo-50/20 dark:from-zinc-900/40 dark:to-zinc-950/60 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                AI Spending Insights
              </CardTitle>
              <CardDescription>
                Get personalized tips and savings recommendations powered by Google Gemini.
              </CardDescription>
            </div>
            <Link href="/insights">
              <Button className="bg-violet-600 hover:bg-violet-700 dark:bg-violet-600 dark:hover:bg-violet-700 text-white font-medium shadow-sm shrink-0">
                View AI Insights
              </Button>
            </Link>
          </CardHeader>
        </Card>

        <ExpenseCharts categoryData={categoryData} monthlyData={monthlyData} />

        <DailyExpensesChart data={dailyData} />

        <Card className="bg-white/40 dark:bg-zinc-900/40 border-gray-200/50 dark:border-zinc-800/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Recent Expenses</CardTitle>
            <Link href="/expenses" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300">
              View All Expenses →
            </Link>
          </CardHeader>
          <CardContent>
            {expenses.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No expenses yet. Add your first expense to get started!
              </p>
            ) : (
              <div className="space-y-4">
                {expenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-900/40 border border-gray-100/60 dark:border-gray-800/40 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{expense.description}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {expense.category.name} •{" "}
                        {new Date(expense.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-lg font-bold text-gray-900 dark:text-gray-100">Rs. {expense.amount.toFixed(2)}</p>
                      <DeleteExpenseButton expenseId={expense.id} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
