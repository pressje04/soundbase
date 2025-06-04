import { cookies } from 'next/headers';
import jwt, { JwtPayload } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

export function getCurrentUser(): { id: string } | null {
  try {
    const cookieStore = cookies(); // synchronous
    // @ts-expect-error - cookies() is actually synchronous in App Router
    const token = cookies().get('token')?.value;


    if (!token) return null;

    const decoded = jwt.verify(token, JWT_SECRET);

    if (typeof decoded === 'object' && 'userId' in decoded) {
      return { id: (decoded as JwtPayload).userId as string };
    }

    return null;
  } catch (err) {
    console.error('[getCurrentUser] JWT verification failed:', err);
    return null;
  }
}
