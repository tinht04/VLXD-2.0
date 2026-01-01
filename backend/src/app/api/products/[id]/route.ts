import { NextRequest } from "next/server";
import prisma from "@/lib/db/prisma";
import { success, badRequest, serverError, verifyAuth } from "@/lib/utils/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
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
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Auth temporarily disabled
    // const user = verifyAuth(request);
    // if (!user) {
    //   return badRequest("Unauthorized");
    // }

    const data = await request.json();

    const product = await prisma.product.update({
      where: { id: params.id },
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
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Auth temporarily disabled
    // const user = verifyAuth(request);
    // if (!user) {
    //   return badRequest("Unauthorized");
    // }

    await prisma.product.delete({
      where: { id: params.id },
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
