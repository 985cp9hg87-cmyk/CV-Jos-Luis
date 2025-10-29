import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/db";
export async function POST(req: Request){
  try{
    const { type, label } = await req.json();
    const ua = req.headers.get("user-agent") || null;
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
    if(!type){ return NextResponse.json({ ok:false, error:"type requerido" }, { status:400 }); }
    const db = getSupabase();
    if(!db){ console.log("[track] no-supabase", { type, label, ua, ip }); return NextResponse.json({ ok:true, stored:false }); }
    const { error } = await db.from("events").insert({ type, label: label ?? null, user_agent: ua, ip });
    if(error){ console.error("[track] insert error", error); return NextResponse.json({ ok:false, error: String(error.message||error) }, { status:500 }); }
    return NextResponse.json({ ok:true, stored:true });
  }catch(e:any){
    return NextResponse.json({ ok:false, error:String(e?.message||e) }, { status:500 });
  }
}