import { NextRequest } from "next/server";
import prisma from "@/lib/db/prisma";
import { success, badRequest, serverError } from "@/lib/utils/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return badRequest("Product not found");
    }

    return success(product);
  } catch (error) {
    console.error("GET /api/products/[id] error:", error);
    return serverError("Failed to fetch product");
  }
}

export async function PUT(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Auth temporarily disabled
    // const user = verifyAuth(request);
    // if (!user) {
    //   return badRequest("Unauthorized");
    // }

    const data = await _request.json();

    const product = await prisma.product.update({
      where: { id },
      data,
    });

    return success({ product });
  } catch (error: any) {
    if (error.code === "P2025") {
      return badRequest("Product not found");
    }
    console.error("PUT /api/products/[id] error:", error);
    return serverError("Failed to update product");
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Auth temporarily disabled
    // const user = verifyAuth(request);
    // if (!user) {
    //   return badRequest("Unauthorized");
    // }

    await prisma.product.delete({
      where: { id },
    });

    return success({ message: "Product deleted" });
  } catch (error: any) {
    if (error.code === "P2025") {
      return badRequest("Product not found");
    }
    console.error("DELETE /api/products/[id] error:", error);
    return serverError("Failed to delete product");
  }
}
