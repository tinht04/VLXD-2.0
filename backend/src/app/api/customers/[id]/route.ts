import { NextRequest } from "next/server";
import prisma from "@/lib/db/prisma";
import { success, badRequest, serverError, verifyAuth } from "@/lib/utils/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: params.id },
      include: {
        invoices: {
          orderBy: { date: "desc" },
          take: 10,
        },
      },
    });

    if (!customer) {
      return badRequest("Customer not found");
    }

    return success(customer);
  } catch (error) {
    console.error("GET /api/customers/[id] error:", error);
    return serverError("Failed to fetch customer");
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = verifyAuth(request);
    if (!user) {
      return badRequest("Unauthorized");
    }

    const data = await request.json();

    const customer = await prisma.customer.update({
      where: { id: params.id },
      data,
    });

    return success(customer);
  } catch (error: any) {
    if (error.code === "P2025") {
      return badRequest("Customer not found");
    }
    console.error("PUT /api/customers/[id] error:", error);
    return serverError("Failed to update customer");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = verifyAuth(request);
    if (!user) {
      return badRequest("Unauthorized");
    }

    await prisma.customer.delete({
      where: { id: params.id },
    });

    return success({ message: "Customer deleted" });
  } catch (error: any) {
    if (error.code === "P2025") {
      return badRequest("Customer not found");
    }
    console.error("DELETE /api/customers/[id] error:", error);
    return serverError("Failed to delete customer");
  }
}
