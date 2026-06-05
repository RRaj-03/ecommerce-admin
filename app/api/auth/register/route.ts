import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import bcrypt from "bcryptjs";
import prismadb from "@/lib/prismadb";
import { sessionOptions, SessionData } from "@/lib/session";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const existing = await prismadb.adminUser.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const admin = await prismadb.adminUser.create({
      data: { name, email: email.toLowerCase(), passwordHash },
    });

    const session = await getIronSession<SessionData>(cookies(), sessionOptions);
    session.userId = admin.id;
    session.name = admin.name;
    session.email = admin.email;
    session.isLoggedIn = true;
    await session.save();

    return NextResponse.json({ id: admin.id, name: admin.name, email: admin.email }, { status: 201 });
  } catch (error) {
    console.error("[ADMIN_REGISTER]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
