import { connectToDb } from "@/lib/utils";
export const dynamic = "force-dynamic";
export async function GET() {
  try { const db = await connectToDb(); await db.connection.db.command({ ping: 1 }, { timeoutMS: 5000 }); return Response.json({ status: "ready" }, { headers: { "Cache-Control": "no-store" } }); }
  catch { return Response.json({ status: "unavailable" }, { status: 503, headers: { "Cache-Control": "no-store", "Retry-After": "5" } }); }
}
