// src/app/api/debug/env/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    databaseUrlStart: process.env.DATABASE_URL?.slice(0, 80),
    supabaseUrl: process.env.SUPABASE_PROJECT_URL,
    publicSupabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    serviceKeyRef: process.env.SUPABASE_SERVICE_ROLE_KEY
      ? JSON.parse(
          Buffer.from(
            process.env.SUPABASE_SERVICE_ROLE_KEY.split(".")[1],
            "base64"
          ).toString()
        ).ref
      : null,
  });
}