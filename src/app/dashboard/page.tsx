import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Get user's expenses
  const expenses = await prisma.expense.findMany({
    where: { userId: session.user.id as string },
    include: { category: true },
    orderBy: { date: "desc" },
    take: 5, // Show latest 5 expenses
  });

  // Calculate total expenses
  const totalExpenses = await prisma.expense.aggregate({
    where: { userId: session.user.id as string },
    _sum: { amount: true },
  });

  // Get expense count
  const expenseCount = await prisma.expense.count({
    where: { userId: session.user.id as string },
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Welcome back, {session.user.name}!</p>
          </div>
          <Link href="/expenses/add">
            <Button>Add Expense</Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                ${totalExpenses._sum.amount?.toFixed(2) || "0.00"}
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
                  ? ((totalExpenses._sum.amount || 0) / expenseCount).toFixed(2)
                  : "0.00"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Expenses */}
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
                    <p className="text-lg font-bold">${expense.amount.toFixed(2)}</p>
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