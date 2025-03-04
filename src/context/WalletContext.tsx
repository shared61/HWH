"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { Wallet, WalletTransaction } from '@/types/wallet';
import { investInCircle, saveInvestment, updateCircleAmount } from '@/lib/firebase/investments';

interface WalletContextType {
  wallet: Wallet | null;
  balance: number;
  transactions: WalletTransaction[];
  loading: boolean;
  error: string | null;
  refreshWallet: () => Promise<void>;
  refreshTransactions: () => Promise<void>;
  addFunds: (amount: number) => Promise<void>;
  investInCircleFromWallet: (circleId: string, circleName: string, amount: number) => Promise<{ success: boolean; message: string }>;
}

const WalletContext = createContext<WalletContextType>({
  wallet: null,
  balance: 0,
  transactions: [],
  loading: false,
  error: null,
  refreshWallet: async () => {},
  refreshTransactions: async () => {},
  addFunds: async () => {},
  investInCircleFromWallet: async () => ({ success: false, message: '' })
});

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const { currentUser } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load wallet data from localStorage on component mount
  useEffect(() => {
    if (currentUser) {
      const userId = currentUser.uid;
      
      // Load balance
      const savedBalance = localStorage.getItem(`wallet_balance_${userId}`);
      if (savedBalance) {
        const parsedBalance = parseFloat(savedBalance);
        setBalance(parsedBalance);
        
        // Create wallet object
        setWallet({
          id: userId,
          userId: userId,
          balance: parsedBalance,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      } else {
        // Initialize wallet if it doesn't exist
        const newWallet = {
          id: userId,
          userId: userId,
          balance: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        setWallet(newWallet);
        localStorage.setItem(`wallet_balance_${userId}`, '0');
      }
      
      // Load transactions
      const savedTransactions = localStorage.getItem(`wallet_transactions_${userId}`);
      if (savedTransactions) {
        try {
          const parsedTransactions = JSON.parse(savedTransactions);
          // Convert string dates back to Date objects
          const transactionsWithDates = parsedTransactions.map((tx: any) => ({
            ...tx,
            createdAt: new Date(tx.createdAt)
          }));
          setTransactions(transactionsWithDates);
        } catch (error) {
          console.error('Error parsing saved transactions:', error);
          setTransactions([]);
        }
      }
    } else {
      // Reset state if no user
      setWallet(null);
      setBalance(0);
      setTransactions([]);
    }
  }, [currentUser]);

  // Add funds to wallet
  const addFunds = async (amount: number) => {
    if (!currentUser) {
      setError('User not authenticated');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const userId = currentUser.uid;
      const newBalance = balance + amount;
      
      // Update balance in state and localStorage
      setBalance(newBalance);
      localStorage.setItem(`wallet_balance_${userId}`, newBalance.toString());
      
      // Create transaction record
      const newTransaction: WalletTransaction = {
        id: `tx_${Date.now()}`,
        userId: userId,
        amount: amount,
        type: 'deposit',
        status: 'completed',
        description: `Added ₹${amount} to wallet`,
        createdAt: new Date(),
        razorpayPaymentId: `sim_${Date.now()}`
      };
      
      // Update transactions in state
      const updatedTransactions = [newTransaction, ...transactions];
      setTransactions(updatedTransactions);
      
      // Save transactions to localStorage
      const transactionsForStorage = updatedTransactions.map(tx => ({
        ...tx,
        createdAt: tx.createdAt.toISOString()
      }));
      localStorage.setItem(`wallet_transactions_${userId}`, JSON.stringify(transactionsForStorage));
      
      // Update wallet
      if (wallet) {
        const updatedWallet = {
          ...wallet,
          balance: newBalance,
          updatedAt: new Date()
        };
        setWallet(updatedWallet);
      }
      
      return Promise.resolve();
    } catch (err: any) {
      console.error('Error adding funds:', err);
      setError(err.message || 'Failed to add funds');
      return Promise.reject(err);
    } finally {
      setLoading(false);
    }
  };

  // Invest in a circle from wallet
  const investInCircleFromWallet = async (circleId: string, circleName: string, amount: number) => {
    if (!currentUser) {
      setError('User not authenticated');
      return { success: false, message: 'User not authenticated' };
    }

    if (amount <= 0) {
      setError('Investment amount must be greater than zero');
      return { success: false, message: 'Investment amount must be greater than zero' };
    }

    if (amount > balance) {
      setError('Insufficient funds in wallet');
      return { success: false, message: 'Insufficient funds in wallet' };
    }

    try {
      setLoading(true);
      setError(null);
      
      const userId = currentUser.uid;
      
      // Simulate investing in circle
      const result = await investInCircle(userId, circleId, amount, circleName);
      
      if (result.success && result.transaction) {
        // Deduct from wallet balance
        const newBalance = balance - amount;
        setBalance(newBalance);
        localStorage.setItem(`wallet_balance_${userId}`, newBalance.toString());
        
        // Add transaction to wallet history
        const updatedTransactions = [result.transaction, ...transactions];
        setTransactions(updatedTransactions);
        
        // Save transactions to localStorage
        const transactionsForStorage = updatedTransactions.map(tx => ({
          ...tx,
          createdAt: tx.createdAt.toISOString()
        }));
        localStorage.setItem(`wallet_transactions_${userId}`, JSON.stringify(transactionsForStorage));
        
        // Update wallet object
        if (wallet) {
          const updatedWallet = {
            ...wallet,
            balance: newBalance,
            updatedAt: new Date()
          };
          setWallet(updatedWallet);
        }
        
        // Save investment record
        await saveInvestment(userId, circleId, amount, circleName);
        
        // Update circle's fund pool
        await updateCircleAmount(circleId, amount);
        
        return { success: true, message: result.message };
      } else {
        setError(result.message);
        return { success: false, message: result.message };
      }
    } catch (err: any) {
      console.error('Error investing in circle:', err);
      const errorMessage = err.message || 'Failed to invest in circle';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const refreshWallet = async () => {
    // In local storage mode, we just re-read from localStorage
    if (currentUser) {
      const userId = currentUser.uid;
      const savedBalance = localStorage.getItem(`wallet_balance_${userId}`);
      if (savedBalance) {
        setBalance(parseFloat(savedBalance));
      }
    }
  };

  const refreshTransactions = async () => {
    // In local storage mode, we just re-read from localStorage
    if (currentUser) {
      const userId = currentUser.uid;
      const savedTransactions = localStorage.getItem(`wallet_transactions_${userId}`);
      if (savedTransactions) {
        try {
          const parsedTransactions = JSON.parse(savedTransactions);
          const transactionsWithDates = parsedTransactions.map((tx: any) => ({
            ...tx,
            createdAt: new Date(tx.createdAt)
          }));
          setTransactions(transactionsWithDates);
        } catch (error) {
          console.error('Error parsing saved transactions:', error);
        }
      }
    }
  };

  const value = {
    wallet,
    balance,
    transactions,
    loading,
    error,
    refreshWallet,
    refreshTransactions,
    addFunds,
    investInCircleFromWallet
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = (): WalletContextType => {
  return useContext(WalletContext);
}; 