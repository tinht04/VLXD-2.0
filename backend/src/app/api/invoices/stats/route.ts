import { NextRequest } from "next/server";
import prisma from "@/lib/db/prisma";
import { success, serverError } from "@/lib/utils/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const where: any = {};

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: { items: true },
    });

    // Aggregate statistics
    const totalRevenue = invoices.reduce(
      (sum: number, inv: any) => sum + inv.totalAmount,
      0
    );
    const totalInvoices = invoices.length;
    const averageInvoiceValue =
      totalInvoices > 0 ? totalRevenue / totalInvoices : 0;

    // Top products
    const allItems = invoices.flatMap((inv: any) => inv.items);
    const productStats = Array.from(
      allItems
        .reduce((map: any, item: any) => {
          const key = item.productName;
          const current = map.get(key) || {
            productName: item.productName,
            quantity: 0,
            revenue: 0,
          };
          return map.set(key, {
            ...current,
            quantity: current.quantity + item.quantity,
            revenue: current.revenue + item.total,
          });
        }, new Map())
        .values()
    )
      .sort((a: any, b: any) => b.revenue - a.revenue)
      .slice(0, 10);

    // Daily revenue
    const dailyRevenue = Array.from(
      invoices
        .reduce((map: any, inv: any) => {
          const day = inv.date.toISOString().split("T")[0];
          const current = map.get(day) || { date: day, revenue: 0, count: 0 };
          return map.set(day, {
            ...current,
            revenue: current.revenue + inv.totalAmount,
            count: current.count + 1,
          });
        }, new Map())
        .values()
    ).sort((a: any, b: any) => a.date.localeCompare(b.date));

    return success({
      summary: {
        totalRevenue,
        totalInvoices,
        averageInvoiceValue,
        period: {
          startDate,
          endDate,
        },
      },
      productStats,
      dailyRevenue,
    });
  } catch (error) {
    console.error("GET /api/invoices/stats error:", error);
    return serverError("Failed to fetch statistics");
  }
}
