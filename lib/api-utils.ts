// lib/api-utils.ts
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

export function handleApiError(error: unknown) {
  console.error("API Error:", error);

  // Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: error.issues.map((err) => ({
          path: err.path.join("."),
          message: err.message,
        })),
      },
      { status: 400 }
    );
  }

  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique constraint violation
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "A record with this value already exists" },
        { status: 409 }
      );
    }

    // Record not found
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Record not found" },
        { status: 404 }
      );
    }

    // Foreign key constraint violation
    if (error.code === "P2003") {
      return NextResponse.json(
        { error: "Related record not found" },
        { status: 400 }
      );
    }
  }

  // Generic error
  return NextResponse.json(
    { error: "Internal server error" },
    { status: 500 }
  );
}

export function unauthorizedResponse() {
  return NextResponse.json(
    { error: "Unauthorized" },
    { status: 401 }
  );
}

export function notFoundResponse(resource: string = "Resource") {
  return NextResponse.json(
    { error: `${resource} not found` },
    { status: 404 }
  );
}

export function forbiddenResponse(message: string = "Forbidden") {
  return NextResponse.json(
    { error: message },
    { status: 403 }
  );
}