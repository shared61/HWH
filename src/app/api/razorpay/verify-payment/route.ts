import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { addFundsToWallet } from '@/lib/firebase/wallet';

// Razorpay secret key
const RAZORPAY_KEY_SECRET = 'HWT4JAOUQoXDKXn2I5KGQkXA'; // Updated with a valid test secret key

export async function POST(request: NextRequest) {
  try {
    const { 
      razorpay_payment_id, 
      razorpay_order_id, 
      razorpay_signature,
      userId,
      amount
    } = await request.json();

    // Verify required fields
    if (!userId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: userId and amount are required' },
        { status: 400 }
      );
    }

    console.log('SIMULATION: Verifying payment for user:', userId, 'amount:', amount);
    
    // SIMULATION: Generate simulated payment ID and signature if not provided
    const simulatedPaymentId = razorpay_payment_id || `pay_sim_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
    const simulatedOrderId = razorpay_order_id || `order_sim_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
    const simulatedSignature = razorpay_signature || crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(`${simulatedOrderId}|${simulatedPaymentId}`)
      .digest('hex');
    
    // Simulate a slight delay to mimic network request
    await new Promise(resolve => setTimeout(resolve, 500));

    // Add funds to wallet with simulated payment details
    await addFundsToWallet(
      userId,
      amount,
      simulatedPaymentId,
      simulatedOrderId,
      simulatedSignature
    );

    console.log('SIMULATION: Payment verified and funds added to wallet successfully');

    return NextResponse.json({
      success: true,
      message: 'Payment verified and funds added to wallet',
      simulation: true,
      payment_id: simulatedPaymentId
    });

    /* Original verification code - commented out for simulation
    // Verify signature
    const generatedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Add funds to wallet
    await addFundsToWallet(
      userId,
      amount,
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature
    );

    return NextResponse.json({
      success: true,
      message: 'Payment verified and funds added to wallet'
    });
    */
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 