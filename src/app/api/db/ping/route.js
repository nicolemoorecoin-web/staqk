export async function GET() {
  return Response.json({ ok: true, db: "disabled" });
}
