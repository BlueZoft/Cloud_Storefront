import { connectToDb } from "@/lib/utils";
export const dynamic = "force-dynamic";
export async function GET() {
  try { await connectToDb(); return Response.json({ status: "ready" }); }
  catch { return Response.json({ status: "unavailable" }, { status: 503 }); }
}
