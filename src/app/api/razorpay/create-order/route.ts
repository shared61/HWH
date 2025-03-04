import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Razorpay test key
const RAZORPAY_KEY_ID = 'rzp_test_a4zcZABGsJEBrs';
const RAZORPAY_KEY_SECRET = 'HWT4JAOUQoXDKXn2I5KGQkXA'; // Updated with a valid test secret key

export async function POST(request: NextRequest) {
  try {
    const { amount, currency = 'INR', receipt = 'order_receipt' } = await request.json();

    if (!amount) {
      return NextResponse.json(
        { error: 'Amount is required' },
        { status: 400 }
      );
    }

    console.log('SIMULATION: Creating Razorpay order for amount:', amount);

    // SIMULATION: Instead of calling Razorpay API, generate a simulated successful response
    const simulatedOrderId = `order_sim_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
    
    // Simulate a slight delay to mimic network request
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return simulated order data
    return NextResponse.json({
      id: simulatedOrderId,
      amount: amount * 100, // Razorpay expects amount in paise
      currency: currency,
      key: RAZORPAY_KEY_ID
    });
    
    /* Original Razorpay API call code - commented out for simulation
    // Create Razorpay order
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64')}`
      },
      body: JSON.stringify({
        amount: amount * 100, // Razorpay expects amount in paise
        currency,
        receipt,
        payment_capture: 1 // Auto-capture payment
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Razorpay API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to create Razorpay order', details: errorData },
        { status: response.status }
      );
    }

    const order = await response.json();
    
    return NextResponse.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      key: RAZORPAY_KEY_ID
    });
    */
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 