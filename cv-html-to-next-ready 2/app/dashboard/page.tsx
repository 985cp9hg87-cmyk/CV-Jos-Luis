export const revalidate = 0;

interface Metrics {
  totals: {
    visits: number;
    cta_clicks: number;
    leads: number;
  };
  last7: Array<{
    day: string;
    visits: number;
    cta_clicks: number;
    leads: number;
  }>;
  topCtas: Array<{
    label: string;
    clicks: number;
  }>;
  conversion: number;
}

async function fetchMetrics(): Promise<Metrics> {
  const res = await fetch(`http://localhost:${process.env.PORT || 3000}/api/metrics`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return {
      totals: { visits: 0, cta_clicks: 0, leads: 0 },
      last7: [],
      topCtas: [],
      conversion: 0,
    };
  }

  return res.json();
}

export default async function DashboardPage() {
  const metrics = await fetchMetrics();

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)" }}>
      <div className="wrap" style={{ paddingTop: "40px", paddingBottom: "60px" }}>
        <header style={{ marginBottom: "32px" }}>
          <h1 style={{ margin: "0 0 8px", fontSize: "36px", fontWeight: 800 }}>Dashboard</h1>
          <p style={{ margin: 0, color: "var(--muted)" }}>
            Métricas de actividad del CV
          </p>
        </header>

        <section style={{ marginBottom: "32px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "16px",
            }}
          >
            <div className="panel" style={{ textAlign: "center" }}>
              <div style={{ fontSize: "14px", color: "var(--muted)", marginBottom: "8px" }}>
                Visitas
              </div>
              <div style={{ fontSize: "48px", fontWeight: 800, color: "var(--brand1)" }}>
                {metrics.totals.visits}
              </div>
            </div>

            <div className="panel" style={{ textAlign: "center" }}>
              <div style={{ fontSize: "14px", color: "var(--muted)", marginBottom: "8px" }}>
                Clics CTA
              </div>
              <div style={{ fontSize: "48px", fontWeight: 800, color: "var(--brand2)" }}>
                {metrics.totals.cta_clicks}
              </div>
            </div>

            <div className="panel" style={{ textAlign: "center" }}>
              <div style={{ fontSize: "14px", color: "var(--muted)", marginBottom: "8px" }}>
                Leads
              </div>
              <div style={{ fontSize: "48px", fontWeight: 800, color: "#10b981" }}>
                {metrics.totals.leads}
              </div>
            </div>

            <div className="panel" style={{ textAlign: "center" }}>
              <div style={{ fontSize: "14px", color: "var(--muted)", marginBottom: "8px" }}>
                Conversión
              </div>
              <div style={{ fontSize: "48px", fontWeight: 800, color: "#f59e0b" }}>
                {metrics.conversion.toFixed(1)}%
              </div>
            </div>
          </div>
        </section>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          <section className="panel">
            <h2 className="section-title" style={{ marginBottom: "16px" }}>
              Últimos 7 días
            </h2>
            {metrics.last7.length > 0 ? (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--stroke)" }}>
                      <th style={{ textAlign: "left", padding: "8px", fontSize: "14px" }}>
                        Día
                      </th>
                      <th style={{ textAlign: "right", padding: "8px", fontSize: "14px" }}>
                        Visitas
                      </th>
                      <th style={{ textAlign: "right", padding: "8px", fontSize: "14px" }}>
                        CTAs
                      </th>
                      <th style={{ textAlign: "right", padding: "8px", fontSize: "14px" }}>
                        Leads
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.last7.map((row) => (
                      <tr key={row.day} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <td style={{ padding: "12px 8px", fontSize: "14px" }}>{row.day}</td>
                        <td style={{ padding: "12px 8px", textAlign: "right", fontSize: "14px" }}>
                          {row.visits}
                        </td>
                        <td style={{ padding: "12px 8px", textAlign: "right", fontSize: "14px" }}>
                          {row.cta_clicks}
                        </td>
                        <td style={{ padding: "12px 8px", textAlign: "right", fontSize: "14px" }}>
                          {row.leads}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ color: "var(--muted)" }}>Sin datos</p>
            )}
          </section>

          <section className="panel">
            <h2 className="section-title" style={{ marginBottom: "16px" }}>
              Top CTAs
            </h2>
            {metrics.topCtas.length > 0 ? (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--stroke)" }}>
                      <th style={{ textAlign: "left", padding: "8px", fontSize: "14px" }}>
                        CTA
                      </th>
                      <th style={{ textAlign: "right", padding: "8px", fontSize: "14px" }}>
                        Clics
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.topCtas.map((row) => (
                      <tr key={row.label} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <td style={{ padding: "12px 8px", fontSize: "14px" }}>{row.label}</td>
                        <td
                          style={{
                            padding: "12px 8px",
                            textAlign: "right",
                            fontSize: "14px",
                            fontWeight: 700,
                            color: "var(--brand2)",
                          }}
                        >
                          {row.clicks}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ color: "var(--muted)" }}>Sin datos</p>
            )}
          </section>
        </div>

        <div style={{ marginTop: "32px", textAlign: "center" }}>
          <a
            href="/"
            style={{
              display: "inline-block",
              padding: "12px 24px",
              borderRadius: "12px",
              background: "linear-gradient(180deg, var(--brand1), var(--brand2))",
              color: "#07131a",
              fontWeight: 800,
              textDecoration: "none",
              border: "1px solid rgba(14,165,233,.65)",
            }}
          >
            ← Volver al CV
          </a>
        </div>
      </div>
    </div>
  );
}
