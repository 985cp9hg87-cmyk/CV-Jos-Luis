import { getDb } from "./init";
import { randomUUID } from "crypto";

const db = getDb();

console.log("Seeding database...");

const insertEvent = db.prepare(`
  INSERT INTO events (id, created_at, type, label, ua, ip)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const insertContact = db.prepare(`
  INSERT INTO contacts (id, created_at, name, email, message, ua, ip)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const userAgents = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15",
];

const ips = ["192.168.1.1", "10.0.0.5", "172.16.0.10"];

function randomDate(daysAgo: number) {
  const now = new Date();
  now.setDate(now.getDate() - daysAgo);
  now.setHours(Math.floor(Math.random() * 24));
  now.setMinutes(Math.floor(Math.random() * 60));
  return now.toISOString();
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

db.exec("DELETE FROM events");
db.exec("DELETE FROM contacts");

for (let i = 0; i < 20; i++) {
  const daysAgo = Math.floor(Math.random() * 7);
  const types = ["pageview", "cta_click"];
  const type = randomItem(types);
  const label = type === "cta_click" ? randomItem(["email", "wsp", "agenda"]) : null;

  insertEvent.run(
    randomUUID(),
    randomDate(daysAgo),
    type,
    label,
    randomItem(userAgents),
    randomItem(ips)
  );
}

insertContact.run(
  randomUUID(),
  randomDate(2),
  "María González",
  "maria.g@example.com",
  "Me interesa conocer más sobre tu perfil profesional.",
  randomItem(userAgents),
  randomItem(ips)
);

insertContact.run(
  randomUUID(),
  randomDate(5),
  "Carlos Pérez",
  "carlos.p@empresa.cl",
  "Tenemos una vacante que podría interesarte.",
  randomItem(userAgents),
  randomItem(ips)
);

console.log("✓ Inserted 20 events and 2 contacts");
console.log("Seeding completed!");

db.close();
