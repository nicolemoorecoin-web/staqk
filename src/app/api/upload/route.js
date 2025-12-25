import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { promises as fs } from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file");
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadsDir, { recursive: true });

  const ext = path.extname(file.name || "").toLowerCase() || ".bin";
  const fname = `${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`;
  const dest = path.join(uploadsDir, fname);

  await fs.writeFile(dest, bytes);

  return NextResponse.json(
    {
      url: `/uploads/${fname}`,
      name: file.name || fname,
      mime: file.type || "application/octet-stream",
      size: bytes.length,
    },
    { headers: { "cache-control": "no-store" } }
  );
}
