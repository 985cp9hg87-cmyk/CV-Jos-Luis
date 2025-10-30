import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db/init";
import { randomUUID } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, label } = body;

    if (!type) {
      return NextResponse.json({ error: "type is required" }, { status: 400 });
    }

    const ua = request.headers.get("user-agent") || "";
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";

    const db = getDb();
    const stmt = db.prepare(`
      INSERT INTO events (id, type, label, ua, ip)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(randomUUID(), type, label || null, ua, ip);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Track error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}