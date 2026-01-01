import { NextRequest } from "next/server";
import prisma from "@/lib/db/prisma";
import { success, badRequest, serverError } from "@/lib/utils/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");

    const where: any = {};

    if (customerId) {
      where.customerId = customerId;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          items: true,
          customer: true,
        },
        orderBy: { date: "desc" },
        skip: offset,
        take: limit,
      }),
      prisma.invoice.count({ where }),
    ]);

    return success({
      invoices,
      pagination: {
        total,
        limit,
        offset,
      },
    });
  } catch (error) {
    console.error("GET /api/invoices error:", error);
    return serverError("Failed to fetch invoices");
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const { customerId, customerName, customerPhone, items, note } = data;

    if (!customerName || !items || items.length === 0) {
      return badRequest("Missing required fields");
    }

    // Handle customer logic
    let finalCustomerId = customerId || null;

    // If new customer (no customerId) and not walk-in, create or find customer
    if (!customerId && customerName !== "Khách lẻ" && customerPhone) {
      try {
        // Try to find existing customer by phone
        const existingCustomer = await prisma.customer.findUnique({
          where: { phone: customerPhone },
        });

        if (existingCustomer) {
          // Use existing customer
          finalCustomerId = existingCustomer.id;
        } else {
          // Create new customer
          const newCustomer = await prisma.customer.create({
            data: {
              name: customerName,
              phone: customerPhone,
              address: null,
            },
          });
          finalCustomerId = newCustomer.id;
        }
      } catch (error: any) {
        // If duplicate error, try to find by phone again
        if (error.code === "P2002") {
          const existingCustomer = await prisma.customer.findUnique({
            where: { phone: customerPhone },
          });
          if (existingCustomer) {
            finalCustomerId = existingCustomer.id;
          }
        }
      }
    }

    // Calculate total
    const totalAmount = items.reduce(
      (sum: number, item: any) => sum + item.total,
      0
    );

    const invoice = await prisma.invoice.create({
      data: {
        customerId: finalCustomerId,
        customerName,
        customerPhone: customerPhone || null,
        totalAmount,
        note: note || null,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            productName: item.productName,
            unit: item.unit,
            quantity: item.quantity,
            price: item.price,
            total: item.total,
          })),
        },
      },
      include: {
        items: true,
        customer: true,
      },
    });

    return success({ invoice }, 201);
  } catch (error) {
    console.error("POST /api/invoices error:", error);
    return serverError("Failed to create invoice");
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return badRequest("Invoice ID required");
    }

    await prisma.invoice.delete({
      where: { id },
    });

    return success({ message: "Invoice deleted" });
  } catch (error) {
    console.error("DELETE /api/invoices error:", error);
    return serverError("Failed to delete invoice");
  }
}
