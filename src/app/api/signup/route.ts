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
        const { identifier, firstName, password, confirmPassword } = await req.json();

        //We require the user to provide either an email OR a phone number
        if (!identifier) {
            return NextResponse.json(
                { field: 'identifier', error: 'Please enter a valid phone number or email address'},
                { status: 400 }
            );
        }

        //User should enter a valid first name
        if (!firstName) {
            return NextResponse.json({error: 'Please enter a valid first name'},
            {status: 400});
        }

        //User must provide a password and confirm it
        if (!password || !confirmPassword) {
            return NextResponse.json(
                { field: 'password', error: 'You must provide a password and confirm it'},
                { status: 400 }
            );
        }

        //User confirms their password by typing it a second time (pretty normal)
        //The two must match
        if (password !== confirmPassword) {
            return NextResponse.json(
                { field: 'confirmPassword', error: 'Passwords must match'},
                { status: 400 }
            );
        }

        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
        const isPhone = /^\+?[0-9]{7,15}$/.test(identifier);
        
        if (!isEmail && !isPhone) {
            return NextResponse.json(
                {field: 'identifier', error: 'Invalid email or phone number format'},
                {status: 400}
            );
        }


        /* --------------- Now that we have processed user input when they sign up, need to verify uniqueness. -------------------------*/

        const existingUser = await prisma.user.findFirst({
            where: isEmail ? {email: identifier} : {phone: identifier},
        });

        if (existingUser) {
            return NextResponse.json({error: 'User already exists with these credentials'},
            {status:409}
            );
        }
        

        /* --------------- Now that we have verified all info is provided and valid, we can deal with JWT ----------------------------*/

        //hash user password using bcrypt for extra protection
        //bcrypt is a modification of the blowfish block cipher
        const hashedPw = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email: isEmail ? identifier : undefined,
                phone: isPhone ? identifier : undefined,
                password: hashedPw,
                firstName,
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
            path: '/',
            sameSite: 'lax',
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
