import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function post(req: NextRequest) {
  try {
    const { email, phone, password } = await req.json();

    if (!password || (!email && !phone)) {
      return NextResponse.json(
        {error: 'Email/phone and password are required'},
        {status: 400}
      );
    }

    //Try to find this user in db
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          email ? { email } : undefined,
          phone ? { phone } : undefined,
         ].filter(Boolean) as any,
      }
    });

    if (!user) {
      return NextResponse.json(
        {error: 'No user found with those specified credentials. Sign up?'},
        {status: 401}
      );
    }

    const rightPassword = await bcrypt.compare(password, user.password);
    if (!rightPassword) {
      return NextResponse.json(
        {error: 'Invalid password'},
        {status: 401}
      );
    }

    const token = jwt.sign(
      { userId: user.id},
      process.env.JWT_SECRET!,
      {expiresIn: '7d'}
    );

    const response = NextResponse.json({ message: 'Login successful' });
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Login error: ', error);
    return NextResponse.json(
      {error: 'Some problem occured during login'},
      {status: 500}
    );
  }
}