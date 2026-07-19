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

  if (!SUPABASE_PROJECT_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Supabase Storage is not configured');
    return NextResponse.json({ error: 'Avatar storage is not configured' }, { status: 500 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'png';
  const filePath = `${SUPABASE_BUCKET}/${userId}.${fileExt}`;

  try {
    const uploadRes = await fetch(`${SUPABASE_PROJECT_URL}/storage/v1/object/${filePath}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': file.type,
        'x-upsert': 'true',
      },
      body: buffer,
    });

    if (!uploadRes.ok) {
      const text = await uploadRes.text();
      console.error('Supabase avatar upload failed:', uploadRes.status, text);
      return NextResponse.json({ error: 'Avatar upload failed' }, { status: 502 });
    }

    const publicUrl = `${SUPABASE_PROJECT_URL}/storage/v1/object/public/${SUPABASE_BUCKET}/${userId}.${fileExt}`;

    await prisma.user.update({
      where: { id: userId },
      data: { image: publicUrl },
    });

    return NextResponse.json({ image: publicUrl });
  } catch (error) {
    console.error('Avatar upload failed:', error);
    return NextResponse.json({ error: 'Avatar upload failed' }, { status: 500 });
  }
}
