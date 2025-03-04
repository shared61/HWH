"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '../../../../components/Layout';
import ProtectedRoute from '../../../../components/ProtectedRoute';
import Card from '../../../../components/Card';
import Button from '../../../../components/Button';
import { useAuth } from '../../../../context/AuthContext';
import { useWallet } from '../../../../context/WalletContext';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Circle } from '../../../../types/circle';
import { getCircleById, joinCircle, leaveCircle } from '../../../../lib/firebase/circles';
import { getUserInvestments } from '../../../../lib/firebase/investments';

export default function CircleDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { currentUser } = useAuth();
  const { balance, investInCircleFromWallet, loading: walletLoading } = useWallet();
  const [circle, setCircle] = useState<Circle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [investmentAmount, setInvestmentAmount] = useState<number>(0);
  const [showInvestmentModal, setShowInvestmentModal] = useState(false);
  const [investmentSuccess, setInvestmentSuccess] = useState<string | null>(null);
  const [investmentError, setInvestmentError] = useState<string | null>(null);
  const [userInvestments, setUserInvestments] = useState<any[]>([]);
  const [totalInvested, setTotalInvested] = useState<number>(0);

  useEffect(() => {
    const fetchCircle = async () => {
      if (!currentUser || !id) return;
      
      setLoading(true);
      setError('');
      
      try {
        const circleData = await getCircleById(id as string);
        if (!circleData) {
          setError('Circle not found');
          return;
        }
        
        setCircle(circleData);
      } catch (err: any) {
        console.error('Error fetching circle:', err);
        setError('Failed to load circle details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCircle();
  }, [currentUser, id]);

  useEffect(() => {
    const fetchUserInvestments = async () => {
      if (!currentUser || !id) return;
      
      try {
        const investments = await getUserInvestments(currentUser.uid, id as string);
        setUserInvestments(investments);
        
        // Calculate total invested
        const total = investments.reduce((sum: number, inv: any) => sum + inv.amount, 0);
        setTotalInvested(total);
      } catch (err) {
        console.error('Error fetching user investments:', err);
      }
    };
    
    fetchUserInvestments();
  }, [currentUser, id, investmentSuccess]);

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

  // Calculate progress percentage
  const calculateProgress = (current: number, goal: number) => {
    if (goal <= 0) return 0;
    const percentage = (current / goal) * 100;
    return Math.min(percentage, 100);
  };

  // Check if user is a member
  const isUserMember = () => {
    if (!currentUser || !circle) return false;
    return circle.members?.includes(currentUser.uid) || false;
  };

  // Check if user is the creator
  const isUserCreator = () => {
    if (!currentUser || !circle) return false;
    return circle.createdBy === currentUser.uid;
  };

  // Handle join circle
  const handleJoinCircle = async () => {
    if (!currentUser || !circle || !circle.id) return;
    
    setActionLoading(true);
    
    try {
      await joinCircle(circle.id, currentUser.uid);
      
      // Update local state
      setCircle(prev => {
        if (!prev) return prev;
        
        const updatedMembers = [...(prev.members || [])];
        if (!updatedMembers.includes(currentUser.uid)) {
          updatedMembers.push(currentUser.uid);
        }
        
        return {
          ...prev,
          members: updatedMembers
        };
      });
    } catch (err: any) {
      console.error('Error joining circle:', err);
      setError(err.message || 'Failed to join circle. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle leave circle
  const handleLeaveCircle = async () => {
    if (!currentUser || !circle || !circle.id) return;
    
    setActionLoading(true);
    
    try {
      await leaveCircle(circle.id, currentUser.uid);
      
      // Update local state
      setCircle(prev => {
        if (!prev) return prev;
        
        return {
          ...prev,
          members: prev.members?.filter(id => id !== currentUser.uid) || []
        };
      });
    } catch (err: any) {
      console.error('Error leaving circle:', err);
      setError(err.message || 'Failed to leave circle. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle investment amount change
  const handleInvestmentAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setInvestmentAmount(isNaN(value) ? 0 : value);
  };

  // Handle investment amount selection
  const handleInvestmentAmountSelect = (value: number) => {
    setInvestmentAmount(value);
  };

  // Handle invest in circle
  const handleInvestInCircle = async () => {
    if (!currentUser || !circle || !circle.id) return;
    if (investmentAmount <= 0) {
      setInvestmentError('Please enter a valid investment amount');
      return;
    }
    
    setActionLoading(true);
    setInvestmentError(null);
    setInvestmentSuccess(null);
    
    try {
      const result = await investInCircleFromWallet(
        circle.id,
        circle.name,
        investmentAmount
      );
      
      if (result.success) {
        setInvestmentSuccess(result.message);
        setInvestmentAmount(0);
        
        // Update circle's current amount in local state
        setCircle(prev => {
          if (!prev) return prev;
          
          return {
            ...prev,
            currentAmount: (prev.currentAmount || 0) + investmentAmount
          };
        });
        
        // Close modal after a delay
        setTimeout(() => {
          setShowInvestmentModal(false);
          setInvestmentSuccess(null);
        }, 3000);
      } else {
        setInvestmentError(result.message);
      }
    } catch (err: any) {
      console.error('Error investing in circle:', err);
      setInvestmentError(err.message || 'Failed to invest in circle. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

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
              <Link href="/dashboard/circles">
                <Button variant="outline" size="sm">
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Circles
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

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="h-12 w-12 rounded-full border-t-4 border-b-4 border-blue-500"
                />
              </div>
            ) : circle ? (
              <div className="space-y-6">
                <Card>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                    <div>
                      <div className="flex items-center">
                        <h1 className="text-2xl font-bold">{circle.name}</h1>
                        <span className={`ml-3 text-xs px-2 py-1 rounded-full ${
                          circle.type === 'public' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                        }`}>
                          {circle.type === 'public' ? 'Public' : 'Private'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Created on {formatDate(circle.createdAt)}
                      </p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0">
                      {isUserMember() && (
                        <Button 
                          onClick={() => setShowInvestmentModal(true)}
                          disabled={actionLoading}
                          className="mb-2 sm:mb-0 sm:mr-2"
                        >
                          <span className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Invest Now
                          </span>
                        </Button>
                      )}
                      
                      {!isUserCreator() && (
                        isUserMember() ? (
                          <Button 
                            variant="outline" 
                            onClick={handleLeaveCircle}
                            disabled={actionLoading}
                          >
                            {actionLoading ? 'Processing...' : 'Leave Circle'}
                          </Button>
                        ) : (
                          <Button 
                            onClick={handleJoinCircle}
                            disabled={actionLoading}
                          >
                            {actionLoading ? 'Processing...' : 'Join Circle'}
                          </Button>
                        )
                      )}
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-2">Description</h2>
                    <p className="text-gray-700 dark:text-gray-300">
                      {circle.description}
                    </p>
                  </div>
                  
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-2">Progress</h2>
                    <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium">Current Amount</span>
                        <span className="font-bold">{formatCurrency(circle.currentAmount || 0)}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium">Goal Amount</span>
                        <span className="font-bold">{formatCurrency(circle.goalAmount)}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-4 mt-4">
                        <div 
                          className="bg-blue-600 h-4 rounded-full flex items-center justify-center text-xs text-white"
                          style={{ width: `${calculateProgress(circle.currentAmount || 0, circle.goalAmount)}%` }}
                        >
                          {Math.round(calculateProgress(circle.currentAmount || 0, circle.goalAmount))}%
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {isUserMember() && userInvestments.length > 0 && (
                    <div className="mb-6">
                      <h2 className="text-lg font-semibold mb-2">Your Investments</h2>
                      <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                        <div className="flex justify-between text-sm mb-4">
                          <span className="font-medium">Total Invested</span>
                          <span className="font-bold">{formatCurrency(totalInvested)}</span>
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
                              {userInvestments.map((investment) => (
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
                    </div>
                  )}
                  
                  <div>
                    <h2 className="text-lg font-semibold mb-2">Members</h2>
                    <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                      <p className="text-gray-700 dark:text-gray-300">
                        {circle.members?.length || 0} members in this circle
                      </p>
                    </div>
                  </div>
                </Card>
                
                {isUserCreator() && (
                  <div className="flex justify-end">
                    <Link href={`/dashboard/circles/${circle.id}/edit`}>
                      <Button variant="outline">
                        <span className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit Circle
                        </span>
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <Card>
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">Circle not found or you don't have access to view it.</p>
                  <Link href="/dashboard/circles">
                    <Button>Go Back to Circles</Button>
                  </Link>
                </div>
              </Card>
            )}
          </motion.div>
        </div>

        {/* Investment Modal */}
        <AnimatePresence>
          {showInvestmentModal && circle && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => !actionLoading && setShowInvestmentModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-xl font-bold mb-4">Invest in {circle.name}</h2>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    Your wallet balance: {formatCurrency(balance)}
                  </p>
                  
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Investment Amount
                  </label>
                  <input
                    type="number"
                    value={investmentAmount || ''}
                    onChange={handleInvestmentAmountChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700"
                    placeholder="Enter amount"
                    min="0"
                    step="1"
                    disabled={actionLoading}
                  />
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleInvestmentAmountSelect(100)}
                    disabled={actionLoading}
                  >
                    ₹100
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleInvestmentAmountSelect(500)}
                    disabled={actionLoading}
                  >
                    ₹500
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleInvestmentAmountSelect(1000)}
                    disabled={actionLoading}
                  >
                    ₹1,000
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleInvestmentAmountSelect(5000)}
                    disabled={actionLoading}
                  >
                    ₹5,000
                  </Button>
                </div>
                
                {investmentError && (
                  <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md text-sm">
                    {investmentError}
                  </div>
                )}
                
                {investmentSuccess && (
                  <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-md text-sm">
                    {investmentSuccess}
                  </div>
                )}
                
                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowInvestmentModal(false)}
                    disabled={actionLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleInvestInCircle}
                    disabled={actionLoading || investmentAmount <= 0 || investmentAmount > balance}
                  >
                    {actionLoading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      'Invest Now'
                    )}
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </Layout>
    </ProtectedRoute>
  );
} 