import { NextRequest } from "next/server";
import prisma from "@/lib/db/prisma";
import { success, badRequest, serverError } from "@/lib/utils/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
      include: {
        items: true,
        customer: true,
      },
    });

    if (!invoice) {
      return badRequest("Invoice not found");
    }

    return success(invoice);
  } catch (error) {
    console.error("GET /api/invoices/[id] error:", error);
    return serverError("Failed to fetch invoice");
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const { customerName, customerPhone, note } = data;

    const invoice = await prisma.invoice.update({
      where: { id: params.id },
      data: {
        customerName,
        customerPhone,
        note,
      },
      include: {
        items: true,
        customer: true,
      },
    });

    return success(invoice);
  } catch (error: any) {
    if (error.code === "P2025") {
      return badRequest("Invoice not found");
    }
    console.error("PUT /api/invoices/[id] error:", error);
    return serverError("Failed to update invoice");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.invoice.delete({
      where: { id: params.id },
    });

    return success({ message: "Invoice deleted" });
  } catch (error: any) {
    if (error.code === "P2025") {
      return badRequest("Invoice not found");
    }
    console.error("DELETE /api/invoices/[id] error:", error);
    return serverError("Failed to delete invoice");
  }
}
