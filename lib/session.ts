import type { SessionOptions } from "iron-session";

export interface SessionData {
  userId?: string;
  name?: string;
  email?: string;
  isLoggedIn: boolean;
}

export const sessionOptions: SessionOptions = {
  cookieName: "admin_auth_session",
  password: process.env.SESSION_SECRET as string,
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
};

// Default session value when no cookie present
export const defaultSession: SessionData = {
  isLoggedIn: false,
};
