export interface WalletTransaction {
  id?: string;
  userId: string;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'transfer';
  status: 'pending' | 'completed' | 'failed';
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  razorpaySignature?: string;
  description?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface Wallet {
  id?: string;
  userId: string;
  balance: number;
  createdAt: Date;
  updatedAt?: Date;
}

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
  created_at: number;
}

export interface RazorpayPayment {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
} 