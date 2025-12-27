import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();

    const cleanEmail = String(email || "").trim().toLowerCase();
    const cleanPassword = String(password || "");

    if (!cleanEmail || cleanPassword.length < 6) {
      return Response.json(
        { ok: false, error: "Email and password (min 6 chars) are required." },
        { status: 400 }
      );
    }

    const exists = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (exists) {
      return Response.json({ ok: false, error: "Email already in use." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(cleanPassword, 10);

    const user = await prisma.user.create({
      data: {
        email: cleanEmail,
        name: name ? String(name).trim() : null,
        passwordHash,
        wallet: { create: {} },
      },
      select: { id: true },
    });

    return Response.json({ ok: true, id: user.id });
  } catch (e) {
    return Response.json(
      { ok: false, error: "Register failed", detail: String(e?.message || e) },
      { status: 500 }
    );
  }
}
