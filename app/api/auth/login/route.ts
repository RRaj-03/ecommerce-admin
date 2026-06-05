import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import bcrypt from "bcryptjs";
import prismadb from "@/lib/prismadb";
import { sessionOptions, SessionData } from "@/lib/session";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    const admin = await prismadb.adminUser.findUnique({ where: { email: email.toLowerCase() } });
    if (!admin) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const session = await getIronSession<SessionData>(cookies(), sessionOptions);
    session.userId = admin.id;
    session.name = admin.name;
    session.email = admin.email;
    session.isLoggedIn = true;
    await session.save();

    return NextResponse.json({ id: admin.id, name: admin.name, email: admin.email });
  } catch (error) {
    console.error("[ADMIN_LOGIN]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
