import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { UnauthorizedError } from "@/lib/adminAuth";

export function handleApiError(error: unknown) {
  if (error instanceof UnauthorizedError) {
    return NextResponse.json({ error: "未授權，請重新登入" }, { status: 401 });
  }
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "輸入資料有誤", issues: error.issues },
      { status: 400 }
    );
  }
  console.error(error);
  return NextResponse.json({ error: "伺服器發生錯誤，請稍後再試" }, { status: 500 });
}
