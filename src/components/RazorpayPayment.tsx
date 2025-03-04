"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useWallet } from '@/context/WalletContext';
import Button from './Button';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayPaymentProps {
  amount: number;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const RazorpayPayment: React.FC<RazorpayPaymentProps> = ({ 
  amount, 
  onSuccess, 
  onError 
}) => {
  const { currentUser } = useAuth();
  const { refreshWallet } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSimulationMode, setIsSimulationMode] = useState(true);
  const [simulationStep, setSimulationStep] = useState<string | null>(null);

  // We don't need to load the actual Razorpay script in simulation mode
  useEffect(() => {
    console.log('SIMULATION MODE ACTIVE: No need to load Razorpay script');
  }, []);

  const handlePayment = async () => {
    if (!currentUser) {
      setError('You must be logged in to make a payment');
      onError?.('You must be logged in to make a payment');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setSimulationStep('Creating order...');
      
      console.log('SIMULATION: Creating Razorpay order for amount:', amount);
      
      // Create simulated order
      const orderResponse = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency: 'INR',
          receipt: `receipt_${Date.now()}`
        }),
      });
      
      const responseData = await orderResponse.json();
      
      if (!orderResponse.ok) {
        console.error('Order creation failed:', responseData);
        throw new Error(responseData.error || 'Failed to create order');
      }
      
      console.log('SIMULATION: Order created successfully:', responseData);
      
      // Instead of opening Razorpay modal, show simulation steps
      setSimulationStep('Processing payment...');
      
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSimulationStep('Verifying payment...');
      
      // Verify simulated payment
      const verifyResponse = await fetch('/api/razorpay/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // We don't need to provide these in simulation mode
          // razorpay_payment_id: 'pay_sim_' + Date.now(),
          // razorpay_order_id: responseData.id,
          // razorpay_signature: 'sim_signature',
          userId: currentUser.uid,
          amount: amount
        }),
      });
      
      const verifyData = await verifyResponse.json();
      
      if (!verifyResponse.ok) {
        console.error('Payment verification failed:', verifyData);
        throw new Error(verifyData.error || 'Payment verification failed');
      }
      
      console.log('SIMULATION: Payment verified successfully:', verifyData);
      setSimulationStep('Payment successful!');
      
      // Refresh wallet balance
      await refreshWallet();
      
      // Simulate a delay before calling success callback
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Call success callback
      onSuccess?.();
      setSimulationStep(null);
      
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message || 'Payment failed');
      onError?.(err.message || 'Payment failed');
      setSimulationStep(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {isSimulationMode && (
        <div className="mb-4 p-3 bg-blue-100 text-blue-700 rounded-md">
          <p className="font-semibold">SIMULATION MODE ACTIVE</p>
          <p className="text-sm">This is a simulated payment flow. No actual API calls to Razorpay.</p>
        </div>
      )}
      
      {simulationStep && (
        <div className="mb-4 p-3 bg-gray-100 text-gray-700 rounded-md">
          <div className="flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{simulationStep}</span>
          </div>
        </div>
      )}
      
      <Button 
        onClick={handlePayment} 
        disabled={loading}
        className="w-full"
      >
        {loading ? 'Processing...' : `Add ₹${amount} to Wallet`}
      </Button>
      
      {isSimulationMode && (
        <div className="mt-4 text-xs text-gray-500">
          <p>* This is a simulated payment flow for testing purposes.</p>
          <p>* No actual payment gateway will be opened.</p>
        </div>
      )}
    </div>
  );
};

export default RazorpayPayment; 