import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db/init";
import { randomUUID } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = String(body?.name || "").slice(0, 200);
    const email = String(body?.email || "").slice(0, 200);
    const message = String(body?.message || "").slice(0, 4000);
    const ua = request.headers.get("user-agent") || "";
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";

    if (!name || !email || !message) {
      return NextResponse.json({ ok: false, error: "faltan campos" }, { status: 400 });
    }

    const db = getDb();
    const stmt = db.prepare(`
      INSERT INTO contacts (id, name, email, message, ua, ip)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(randomUUID(), name, email, message, ua, ip);

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("Contact error:", e);
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}