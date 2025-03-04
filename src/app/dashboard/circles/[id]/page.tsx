"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '../../../../components/Layout';
import ProtectedRoute from '../../../../components/ProtectedRoute';
import Card from '../../../../components/Card';
import Button from '../../../../components/Button';
import { useAuth } from '../../../../context/AuthContext';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Circle } from '../../../../types/circle';
import { getCircleById, joinCircle, leaveCircle } from '../../../../lib/firebase/circles';

export default function CircleDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { currentUser } = useAuth();
  const [circle, setCircle] = useState<Circle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

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
      </Layout>
    </ProtectedRoute>
  );
} 