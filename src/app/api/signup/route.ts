/*
This is the signup route that essentially acts as a signup API. 
*/
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

//This API endpoint will handle a user requesting to signup for the app
export async function POST(req: NextRequest) {
    try {
        const { identifier, password, confirmPassword } = await req.json();

        //We require the user to provide either an email OR a phone number
        if (!identifier) {
            return NextResponse.json(
                { error: 'Please enter a valid phone number or email address'},
                { status: 400 }
            );
        }

        //User must provide a password and confirm it
        if (!password || !confirmPassword) {
            return NextResponse.json(
                { error: 'You must provide a password and confirm it'},
                { status: 400 }
            );
        }

        //User confirms their password by typing it a second time (pretty normal)
        //The two must match
        if (password !== confirmPassword) {
            return NextResponse.json(
                { error: 'Passwords must match'},
                { status: 400 }
            );
        }

        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
        const isPhone = /^\+?[0-9]{7,15}$/.test(identifier);
        
        if (!isEmail && !isPhone) {
            return NextResponse.json(
                {error: 'Invalid email or phone number format'},
                {status: 400}
            );
        }


        /* --------------- Now that we have processed user input when they sign up, need to verify uniqueness. -------------------------*/

        //Check if email is in use
        if (email) {
            const existingEmail = await prisma.user.findUnique({ where: { email }});
            if (existingEmail) {
                return NextResponse.json(
                    { error: 'Email already in use'}, { status: 409 }
                );
            }
        }

        //same thing but if the user gave a phone number instead
        if (phone) {
            const existingPhone = await prisma.user.findUnique( { where: { phone }});
            if (existingPhone) {
                return NextResponse.json(
                    { error: 'Phone number already in use'}, { status: 409}
                );
            }
        }

        /* --------------- Now that we have verified all info is provided and valid, we can deal with JWT ----------------------------*/

        //hash user password using bcrypt for extra protection
        //bcrypt is a modification of the blowfish block cipher
        const hashedPw = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                phone,
                password: hashedPw,
            },
        });

        //Generate token, signing it with env secret we defined (random str)
        const jwt_token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET!,
            { expiresIn: '7d'}
        );

        const response = NextResponse.json(
            { message: "Signup successful!"}
        );
        response.cookies.set('token', jwt_token, {
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60,
            path: '/'
        });

        return response;

    } catch (error) {
        console.error('Signup error: ', error);
        return NextResponse.json(
            { error: 'There was a problem during signup'},
            {status: 500}
        );
    }
}
