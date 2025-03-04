"use client";

import React, { useState } from 'react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { useWallet } from '@/context/WalletContext';
import Card from '@/components/Card';
import Button from '@/components/Button';

export default function WalletPage() {
  const { currentUser } = useAuth();
  const { balance, transactions, loading, error: walletError, addFunds } = useWallet();
  const [amount, setAmount] = useState<number>(100);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [simulationStep, setSimulationStep] = useState<string | null>(null);

  const predefinedAmounts = [100, 500, 1000, 5000];

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setAmount(value);
    }
  };

  const handleAmountSelect = (value: number) => {
    setAmount(value);
  };

  const handleAddMoney = async () => {
    try {
      setErrorMessage(null);
      setSuccessMessage(null);
      setSimulationStep('Creating payment...');

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSimulationStep('Processing payment...');
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSimulationStep('Verifying payment...');
      
      // Simulate verification
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add funds using the context function
      await addFunds(amount);
      
      setSuccessMessage(`Successfully added ₹${amount} to your wallet!`);
      setSimulationStep('Payment successful!');
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null);
        setSimulationStep(null);
      }, 5000);
      
    } catch (error) {
      console.error('Error in payment simulation:', error);
      setErrorMessage('An error occurred during the payment simulation.');
      setSimulationStep(null);
      
      // Clear error message after 5 seconds
      setTimeout(() => {
        setErrorMessage(null);
      }, 5000);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">My Wallet</h1>
          
          <div className="mb-4 p-3 bg-blue-100 text-blue-700 rounded-md">
            <p className="font-semibold">LOCAL STORAGE MODE</p>
            <p className="text-sm">This wallet uses browser local storage to persist your balance and transactions.</p>
          </div>
          
          {walletError && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
              {walletError}
            </div>
          )}
          
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
              {errorMessage}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Balance Card */}
            <div className="md:col-span-1">
              <Card className="h-full">
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Wallet Balance</h2>
                  <div className="text-4xl font-bold text-blue-600 mb-4">
                    {formatCurrency(balance)}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Your wallet balance is stored in your browser and will persist across page refreshes.
                  </p>
                </div>
              </Card>
            </div>
            
            {/* Add Money Card */}
            <div className="md:col-span-2">
              <Card className="h-full">
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Add Money to Wallet</h2>
                  
                  {successMessage && (
                    <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
                      {successMessage}
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
                  
                  <div className="mb-4">
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Amount (₹)
                    </label>
                    <input
                      type="number"
                      id="amount"
                      value={amount}
                      onChange={handleAmountChange}
                      min="1"
                      className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    {predefinedAmounts.map((amt) => (
                      <button
                        key={amt}
                        onClick={() => handleAmountSelect(amt)}
                        className={`px-4 py-2 rounded-md ${
                          amount === amt 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                        }`}
                      >
                        ₹{amt}
                      </button>
                    ))}
                  </div>
                  
                  <Button 
                    onClick={handleAddMoney} 
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? 'Processing...' : `Add ₹${amount} to Wallet`}
                  </Button>
                  
                  <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                    <p>* This is a simulation. No actual payment gateway is used.</p>
                    <p>* Your balance and transactions are stored in your browser's local storage.</p>
                    <p>* Clearing your browser data will reset your wallet.</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
          
          {/* Transaction History */}
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">Transaction History</h2>
            
            {loading && transactions.length === 0 ? (
              <div className="text-center py-8">Loading transactions...</div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                No transactions yet. Add money to your wallet to get started.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
                  <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                      <th className="py-3 px-4 text-left">Date</th>
                      <th className="py-3 px-4 text-left">Description</th>
                      <th className="py-3 px-4 text-left">Type</th>
                      <th className="py-3 px-4 text-left">Amount</th>
                      <th className="py-3 px-4 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {transactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                        <td className="py-3 px-4">{formatDate(transaction.createdAt)}</td>
                        <td className="py-3 px-4">{transaction.description || '-'}</td>
                        <td className="py-3 px-4 capitalize">{transaction.type}</td>
                        <td className="py-3 px-4 font-medium">
                          <span className={transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'}>
                            {transaction.type === 'deposit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            transaction.status === 'completed' 
                              ? 'bg-green-100 text-green-800' 
                              : transaction.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                          }`}>
                            {transaction.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
} 