import { NextRequest, NextResponse } from 'next/server';
import { createUserProfile } from '../../../../lib/firebase/firestore';
import { auth } from '../../../../lib/firebase/firebase';
import { DecodedIdToken } from 'firebase-admin/auth';

// Initialize Firebase Admin if not already initialized
let admin: any;
try {
  admin = require('firebase-admin');
  
  if (!admin.apps.length) {
    const serviceAccount = JSON.parse(
      process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}'
    );
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
} catch (error) {
  console.error('Firebase admin initialization error:', error);
}

export async function POST(request: NextRequest) {
  try {
    // Get the authorization token from the request headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized: Missing or invalid token' },
        { status: 401 }
      );
    }

    const idToken = authHeader.split('Bearer ')[1];
    let decodedToken: DecodedIdToken;

    try {
      // Verify the ID token
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (error) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid token' },
        { status: 401 }
      );
    }

    // Get the user data from the request body
    const userData = await request.json();

    // Create the user profile in Firestore
    await createUserProfile(decodedToken.uid, {
      ...userData,
      email: decodedToken.email || userData.email,
    });

    return NextResponse.json(
      { message: 'User profile created successfully' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating user profile:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 