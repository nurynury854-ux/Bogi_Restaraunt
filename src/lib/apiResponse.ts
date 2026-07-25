import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { UnauthorizedError, NotFoundError } from "@/lib/adminAuth";

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "P2002"
  );
}

export function handleApiError(error: unknown) {
  if (error instanceof UnauthorizedError) {
    return NextResponse.json({ error: "Unauthorized — please sign in again" }, { status: 401 });
  }
  if (error instanceof NotFoundError) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "There was a problem with your submission", issues: error.issues },
      { status: 400 }
    );
  }
  if (isUniqueConstraintError(error)) {
    return NextResponse.json(
      { error: "That value is already taken. Please choose another." },
      { status: 409 }
    );
  }
  console.error(error);
  return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
}
