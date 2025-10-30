import { NextResponse } from "next/server";
import { getDb } from "@/db/init";

export async function GET() {
  try {
    const db = getDb();

    const totalsRow = db
      .prepare(
        `
      SELECT
        SUM(CASE WHEN type = 'pageview' THEN 1 ELSE 0 END) as visits,
        SUM(CASE WHEN type = 'cta_click' THEN 1 ELSE 0 END) as cta_clicks,
        SUM(CASE WHEN type = 'lead' THEN 1 ELSE 0 END) as leads
      FROM events
    `
      )
      .get() as { visits: number; cta_clicks: number; leads: number };

    const totals = {
      visits: totalsRow.visits || 0,
      cta_clicks: totalsRow.cta_clicks || 0,
      leads: totalsRow.leads || 0,
    };

    const last7Rows = db
      .prepare(
        `
      SELECT
        DATE(created_at) as day,
        SUM(CASE WHEN type = 'pageview' THEN 1 ELSE 0 END) as visits,
        SUM(CASE WHEN type = 'cta_click' THEN 1 ELSE 0 END) as cta_clicks,
        SUM(CASE WHEN type = 'lead' THEN 1 ELSE 0 END) as leads
      FROM events
      WHERE created_at >= DATE('now', '-7 days')
      GROUP BY DATE(created_at)
      ORDER BY day DESC
    `
      )
      .all() as Array<{ day: string; visits: number; cta_clicks: number; leads: number }>;

    const topCtasRows = db
      .prepare(
        `
      SELECT label, COUNT(*) as clicks
      FROM events
      WHERE type = 'cta_click' AND label IS NOT NULL
      GROUP BY label
      ORDER BY clicks DESC
      LIMIT 5
    `
      )
      .all() as Array<{ label: string; clicks: number }>;

    const conversion = totals.visits > 0 ? (totals.leads / totals.visits) * 100 : 0;

    return NextResponse.json({
      totals,
      last7: last7Rows,
      topCtas: topCtasRows,
      conversion: Math.round(conversion * 100) / 100,
    });
  } catch (error) {
    console.error("Metrics error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
