import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExpenseCharts } from "@/components/dashboard/expense-charts";
import { AiRecommendations } from "@/components/dashboard/ai-recommendations";
import { DeleteExpenseButton } from "@/components/dashboard/delete-expense-button";
import {
  buildCategoryChartData,
  buildMonthlyChartData,
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

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Welcome back, {session.user.name}!</p>
          </div>
          <Link href="/expenses/add">
            <Button>Add Expense</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                ${totalAmount.toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">
                Number of Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{expenseCount}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">
                Average Expense
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                $
                {expenseCount > 0
                  ? (totalAmount / expenseCount).toFixed(2)
                  : "0.00"}
              </p>
            </CardContent>
          </Card>
        </div>

        <AiRecommendations hasExpenses={expenseCount > 0} />

        <ExpenseCharts categoryData={categoryData} monthlyData={monthlyData} />

        <Card>
          <CardHeader>
            <CardTitle>Recent Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            {expenses.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No expenses yet. Add your first expense to get started!
              </p>
            ) : (
              <div className="space-y-4">
                {expenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{expense.description}</p>
                      <p className="text-sm text-gray-600">
                        {expense.category.name} •{" "}
                        {new Date(expense.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-lg font-bold">${expense.amount.toFixed(2)}</p>
                      <DeleteExpenseButton expenseId={expense.id} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
