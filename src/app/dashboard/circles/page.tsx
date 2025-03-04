"use client";

import React, { useEffect, useState } from 'react';
import Layout from '../../../components/Layout';
import ProtectedRoute from '../../../components/ProtectedRoute';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import { useAuth } from '../../../context/AuthContext';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Circle } from '../../../types/circle';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../lib/firebase/firebase';

export default function CirclesPage() {
  const { currentUser } = useAuth();
  const [allCircles, setAllCircles] = useState<Circle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAllCircles = async () => {
      if (!currentUser) return;
      
      setLoading(true);
      setError('');
      
      try {
        console.log("Fetching all circles directly from Firestore...");
        
        // Direct Firestore query without complex filters
        const circlesRef = collection(db, 'circles');
        const querySnapshot = await getDocs(circlesRef);
        
        console.log(`Retrieved ${querySnapshot.size} total circles`);
        
        const circles: Circle[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          // Convert Firestore timestamp to Date
          const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date();
          
          circles.push({
            id: doc.id,
            name: data.name || 'Unnamed Circle',
            description: data.description || '',
            goalAmount: data.goalAmount || 0,
            currentAmount: data.currentAmount || 0,
            type: data.type || 'private',
            status: data.status || 'active',
            createdBy: data.createdBy || '',
            createdAt: createdAt,
            members: data.members || [],
          });
        });
        
        // Sort by creation date (newest first)
        const sortedCircles = circles.sort((a, b) => 
          b.createdAt.getTime() - a.createdAt.getTime()
        );
        
        setAllCircles(sortedCircles);
      } catch (err: any) {
        console.error('Error fetching circles:', err);
        setError('Failed to load circles. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllCircles();
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
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  // Calculate progress percentage
  const calculateProgress = (current: number, goal: number) => {
    if (goal <= 0) return 0;
    const percentage = (current / goal) * 100;
    return Math.min(percentage, 100);
  };

  // Check if user is the creator of a circle
  const isCreator = (circle: Circle) => {
    return currentUser && circle.createdBy === currentUser.uid;
  };

  // Check if user is a member of a circle
  const isMember = (circle: Circle) => {
    return currentUser && circle.members && circle.members.includes(currentUser.uid);
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Investment Circles</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  All investment circles in the platform
                </p>
              </div>
              <div className="flex space-x-3 mt-4 sm:mt-0">
                <Link href="/dashboard/circles/discover">
                  <Button variant="outline" size="sm">
                    <span className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Discover Circles
                    </span>
                  </Button>
                </Link>
                <Link href="/dashboard/circles/create">
                  <Button size="sm">
                    <span className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Create Circle
                    </span>
                  </Button>
                </Link>
              </div>
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
            ) : allCircles.length > 0 ? (
              <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {allCircles.map(circle => (
                    <motion.div
                      key={circle.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="h-full flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-xl font-semibold">{circle.name}</h3>
                          <div className="flex space-x-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              circle.type === 'public' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            }`}>
                              {circle.type === 'public' ? 'Public' : 'Private'}
                            </span>
                            {isCreator(circle) && (
                              <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                                Creator
                              </span>
                            )}
                            {!isCreator(circle) && isMember(circle) && (
                              <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                Member
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-gray-600 dark:text-gray-300 mb-4 flex-grow">
                          {circle.description}
                        </p>
                        
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progress</span>
                            <span>{formatCurrency(circle.currentAmount || 0)} / {formatCurrency(circle.goalAmount)}</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${calculateProgress(circle.currentAmount || 0, circle.goalAmount)}%` }}
                            />
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                          <span>Created: {formatDate(circle.createdAt)}</span>
                          <span>{circle.members?.length || 0} members</span>
                        </div>
                        
                        <Link href={`/dashboard/circles/${circle.id}`}>
                          <Button variant="outline" className="w-full">
                            View Details
                          </Button>
                        </Link>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <Card>
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">No circles available.</p>
                  <Link href="/dashboard/circles/create">
                    <Button>Create Your First Circle</Button>
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