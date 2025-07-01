import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt, { JwtPayload } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;
const SUPABASE_PROJECT_URL = process.env.SUPABASE_PROJECT_URL!;
const SUPABASE_BUCKET = 'pfps';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(req: NextRequest) {
  // @ts-expect-error - sync access is fine here
  const token = cookies().get('token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let userId: string;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    userId = decoded.userId as string;
  } catch (err) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get('avatar') as File;

  if (!file || !file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Invalid image upload' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const fileExt = file.name.split('.').pop();
  const filePath = `${SUPABASE_BUCKET}/${userId}.${fileExt}`;

  // Upload directly to Supabase Storage REST API
  const uploadRes = await fetch(`${SUPABASE_PROJECT_URL}/storage/v1/object/${filePath}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': file.type,
    },
    body: buffer,
  });

  if (!uploadRes.ok) {
    const text = await uploadRes.text();
    return NextResponse.json({ error: `Upload failed: ${text}` }, { status: 500 });
  }

  const publicUrl = `${SUPABASE_PROJECT_URL}/storage/v1/object/public/${SUPABASE_BUCKET}/${userId}.${fileExt}`;

  await prisma.user.update({
    where: { id: userId },
    data: { image: publicUrl },
  });

  return NextResponse.json({ image: publicUrl });
}
