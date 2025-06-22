import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { writeFile } from 'fs/promises';
import path from 'path';
import { nanoid } from 'nanoid';
import { getCurrentUser } from '@/lib/auth'; // make sure this exists and returns the logged-in user

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get('avatar') as File;

  if (!file || !file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Invalid image upload' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const fileName = `${nanoid()}-${file.name}`;
  const filePath = path.join(process.cwd(), 'public/uploads', fileName);

  await writeFile(filePath, buffer);

  const imageUrl = `/uploads/${fileName}`;

  await prisma.user.update({
    where: { id: user.id },
    data: { image: imageUrl },
  });

  return NextResponse.json({ image: imageUrl });
}
