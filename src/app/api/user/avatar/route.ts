import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { getCurrentUser } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createRouteHandlerClient({ cookies });

  const formData = await req.formData();
  const file = formData.get('avatar') as File;

  if (!file || !file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Invalid image upload' }, { status: 400 });
  }

  const fileExt = file.name.split('.').pop();
  const filePath = `pfps/${user.id}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('pfps')
    .upload(filePath, file, { upsert: true });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: urlData } = supabase.storage.from('pfps').getPublicUrl(filePath);
  const imageUrl = urlData?.publicUrl;

  await prisma.user.update({
    where: { id: user.id },
    data: { image: imageUrl },
  });

  return NextResponse.json({ image: imageUrl });
}
