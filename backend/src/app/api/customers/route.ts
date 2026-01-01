import { NextRequest } from "next/server";
import prisma from "@/lib/db/prisma";
import { success, badRequest, serverError } from "@/lib/utils/auth";

export async function GET(_request: NextRequest) {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: "desc" },
    });

    return success({ customers });
  } catch (error) {
    console.error("GET /api/customers error:", error);
    return serverError("Failed to fetch customers");
  }
}

export async function POST(request: NextRequest) {
  try {
    // Auth optional for walk-in customers
    const data = await request.json();

    const { name, phone, address } = data;

    if (!name) {
      return badRequest("Name is required");
    }

    // Phone is optional - if provided, check if customer with this phone already exists
    if (phone) {
      const existing = await prisma.customer.findUnique({
        where: { phone },
      });

      if (existing) {
        return success({ customer: existing }, 200); // Return existing customer
      }
    }

    const customer = await prisma.customer.create({
      data: {
        name,
        phone: phone || null,
        address: address || null,
      },
    });

    return success({ customer }, 201);
  } catch (error: any) {
    if (error.code === "P2002") {
      return badRequest("Customer with this phone already exists");
    }
    console.error("POST /api/customers error:", error);
    return serverError("Failed to create customer");
  }
}
