"use client";

import React, { useEffect, useState } from 'react';
import Layout from '../../../components/Layout';
import ProtectedRoute from '../../../components/ProtectedRoute';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import { useAuth } from '../../../context/AuthContext';
import { useWallet } from '../../../context/WalletContext';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { getUserInvestments } from '../../../lib/firebase/investments';

interface Investment {
  id: string;
  userId: string;
  circleId: string;
  circleName: string;
  amount: number;
  createdAt: Date;
}

export default function InvestmentsPage() {
  const { currentUser } = useAuth();
  const { balance } = useWallet();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalInvested, setTotalInvested] = useState(0);

  useEffect(() => {
    const fetchInvestments = async () => {
      if (!currentUser) return;
      
      setLoading(true);
      setError('');
      
      try {
        const userInvestments = await getUserInvestments(currentUser.uid);
        
        // Convert string dates to Date objects
        const formattedInvestments = userInvestments.map((inv: any) => ({
          ...inv,
          createdAt: inv.createdAt instanceof Date ? inv.createdAt : new Date(inv.createdAt)
        }));
        
        setInvestments(formattedInvestments);
        
        // Calculate total invested
        const total = formattedInvestments.reduce((sum: number, inv: any) => sum + inv.amount, 0);
        setTotalInvested(total);
      } catch (err: any) {
        console.error('Error fetching investments:', err);
        setError('Failed to load investments. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchInvestments();
  }, [currentUser]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  // Group investments by circle
  const investmentsByCircle = investments.reduce((groups: Record<string, Investment[]>, investment) => {
    const { circleId } = investment;
    if (!groups[circleId]) {
      groups[circleId] = [];
    }
    groups[circleId].push(investment);
    return groups;
  }, {});

  return (
    <ProtectedRoute>
      <Layout>
        <div className="container mx-auto px-4 py-8 sm:py-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <h1 className="text-2xl font-bold">Your Investments</h1>
              <Link href="/dashboard/circles">
                <Button>
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Explore Circles
                  </span>
                </Button>
              </Link>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-6 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md text-sm border-l-4 border-red-500"
              >
                {error}
              </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Card>
                <h2 className="text-lg font-semibold mb-2">Investment Summary</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <span className="font-medium">Wallet Balance</span>
                    <span className="font-bold">{formatCurrency(balance)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <span className="font-medium">Total Invested</span>
                    <span className="font-bold">{formatCurrency(totalInvested)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <span className="font-medium">Total Portfolio</span>
                    <span className="font-bold">{formatCurrency(balance + totalInvested)}</span>
                  </div>
                </div>
              </Card>
              
              <Card>
                <h2 className="text-lg font-semibold mb-2">Investment Stats</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <span className="font-medium">Total Circles</span>
                    <span className="font-bold">{Object.keys(investmentsByCircle).length}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <span className="font-medium">Total Transactions</span>
                    <span className="font-bold">{investments.length}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <span className="font-medium">Last Investment</span>
                    <span className="font-bold">
                      {investments.length > 0 
                        ? formatDate(investments[0].createdAt) 
                        : 'No investments yet'}
                    </span>
                  </div>
                </div>
              </Card>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="h-12 w-12 rounded-full border-t-4 border-b-4 border-blue-500"
                />
              </div>
            ) : investments.length > 0 ? (
              <Card>
                <h2 className="text-lg font-semibold mb-4">Investment History</h2>
                
                {Object.entries(investmentsByCircle).map(([circleId, circleInvestments]) => {
                  const circleName = circleInvestments[0].circleName;
                  const totalInvestedInCircle = circleInvestments.reduce((sum, inv) => sum + inv.amount, 0);
                  
                  return (
                    <div key={circleId} className="mb-6 last:mb-0">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
                        <Link href={`/dashboard/circles/${circleId}`}>
                          <h3 className="text-md font-medium hover:text-blue-500 transition-colors">
                            {circleName}
                          </h3>
                        </Link>
                        <span className="text-sm font-bold">
                          Total: {formatCurrency(totalInvestedInCircle)}
                        </span>
                      </div>
                      
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                          <thead>
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {circleInvestments.map((investment) => (
                              <tr key={investment.id}>
                                <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                                  {formatDate(investment.createdAt)}
                                </td>
                                <td className="px-4 py-2 text-sm text-right text-gray-700 dark:text-gray-300">
                                  {formatCurrency(investment.amount)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
              </Card>
            ) : (
              <Card>
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">You haven't made any investments yet.</p>
                  <Link href="/dashboard/circles">
                    <Button>Explore Investment Circles</Button>
                  </Link>
                </div>
              </Card>
            )}
          </motion.div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
} 