
import { NextResponse } from "next/server";
import { getDb } from "@/app/lib/mongodb";

export const runtime = "nodejs";

export async function GET() {
  try {
    const db = await getDb();
    await db.command({ ping: 1 });

    return NextResponse.json({
      status: "ok",
      database: "connected",
    });
  } catch (error) {
    console.error("Database health check failed:", error);

    return NextResponse.json(
      {
        status: "error",
        message: "Database connection failed",
      },
      { status: 503 }
    );
  }
}
