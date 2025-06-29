/*
This is the signup route that essentially acts as a signup API. 
*/
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { identifier, firstName, password, confirmPassword, username } = await req.json();

    // 1. Validate inputs
    if (!identifier) {
      return NextResponse.json({ field: 'identifier', error: 'Please enter a valid phone number or email address' }, { status: 400 });
    }

    if (!firstName) {
      return NextResponse.json({ error: 'Please enter a valid first name' }, { status: 400 });
    }

    if (!username || typeof username !== 'string') {
      return NextResponse.json({ field: 'username', error: 'Username is required' }, { status: 400 });
    }
    
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    
    if (!usernameRegex.test(username)) {
      return NextResponse.json(
        {
          field: 'username',
          error: 'Username must be 3–20 characters and only contain letters, numbers, and underscores.',
        },
        { status: 400 }
      );
    }
    
    if (!password || !confirmPassword) {
      return NextResponse.json({ field: 'password', error: 'You must provide a password and confirm it' }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ field: 'confirmPassword', error: 'Passwords must match' }, { status: 400 });
    }

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
    const isPhone = /^\+?[0-9]{7,15}$/.test(identifier);

    if (!isEmail && !isPhone) {
      return NextResponse.json({ field: 'identifier', error: 'Invalid email or phone number format' }, { status: 400 });
    }

    // 2. Check uniqueness of email/phone
const existingUser = await prisma.user.findFirst({
  where: {
    OR: [
      isEmail ? { email: identifier } : undefined,
      isPhone ? { phone: identifier } : undefined,
    ].filter(Boolean) as any,
  },
});

if (existingUser) {
  return NextResponse.json({ error: 'A user already exists with these credentials' }, { status: 409 });
}

//Check uniqueness of username
const usernameExists = await prisma.user.findUnique({ where: { username } });

if (usernameExists) {
  return NextResponse.json({ field: 'username', error: 'This username is already taken' }, { status: 409 });
}


    // 3. Hash password and create user
    const hashedPw = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email: isEmail ? identifier : undefined,
        phone: isPhone ? identifier : undefined,
        password: hashedPw,
        firstName,
        username,
      },
    });

    const jwt_token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    const response = NextResponse.json({
      success: true,
      message: "Signup successful!",
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        firstName: user.firstName,
        username: user.username,
      },
    });

    response.cookies.set('token', jwt_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
      sameSite: 'lax',
    });

    return response;
  } catch (error) {
    console.error('Signup error: ', error);
    return NextResponse.json(
      { error: 'There was a problem during signup' },
      { status: 500 }
    );
  }
}
