import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/db";
export async function POST(req: Request){
  try{
    const body = await req.json();
    const name = String(body?.name||"").slice(0,200);
    const email = String(body?.email||"").slice(0,200);
    const message = String(body?.message||"").slice(0,4000);
    const ua = req.headers.get("user-agent") || null;
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
    if(!name || !email || !message){ return NextResponse.json({ ok:false, error:"faltan campos" }, { status:400 }); }
    const db = getSupabase();
    if(!db){ console.log("[contact] no-supabase", { name, email, message, ua, ip }); return NextResponse.json({ ok:true, stored:false }); }
    const { error } = await db.from("contacts").insert({ name, email, message, ua, ip });
    if(error){ console.error("[contact] insert error", error); return NextResponse.json({ ok:false, error:String(error.message||error) }, { status:500 }); }
    return NextResponse.json({ ok:true, stored:true });
  }catch(e:any){
    return NextResponse.json({ ok:false, error:String(e?.message||e) }, { status:500 });
  }
}