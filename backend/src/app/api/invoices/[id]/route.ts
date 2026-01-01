import { NextRequest } from "next/server";
import prisma from "@/lib/db/prisma";
import { success, badRequest, serverError } from "@/lib/utils/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const invoice = await prisma.invoice.findUnique({
      where: { id },
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
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await _request.json();
    const { customerName, customerPhone, note } = data;

    const invoice = await prisma.invoice.update({
      where: { id },
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
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.invoice.delete({
      where: { id },
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
