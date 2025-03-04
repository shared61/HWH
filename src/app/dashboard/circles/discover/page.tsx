"use client";

import React, { useEffect, useState } from 'react';
import Layout from '../../../../components/Layout';
import ProtectedRoute from '../../../../components/ProtectedRoute';
import Card from '../../../../components/Card';
import Button from '../../../../components/Button';
import { useAuth } from '../../../../context/AuthContext';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Circle } from '../../../../types/circle';
import { joinCircle } from '../../../../lib/firebase/circles';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../../lib/firebase/firebase';

export default function DiscoverCirclesPage() {
  const { currentUser } = useAuth();
  const [circles, setCircles] = useState<Circle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [joiningCircle, setJoiningCircle] = useState<string | null>(null);

  useEffect(() => {
    const fetchPublicCircles = async () => {
      if (!currentUser) return;
      
      setLoading(true);
      setError('');
      
      try {
        console.log("Fetching all circles directly from Firestore...");
        
        // Direct Firestore query without complex filters
        const circlesRef = collection(db, 'circles');
        const querySnapshot = await getDocs(circlesRef);
        
        console.log(`Retrieved ${querySnapshot.size} total circles`);
        
        const allCircles: Circle[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          // Convert Firestore timestamp to Date
          const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date();
          
          allCircles.push({
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
        
        console.log("All circles:", allCircles);
        
        // Filter for public circles created by other users
        const publicCirclesFromOthers = allCircles.filter(circle => 
          circle.type === 'public' && 
          circle.status === 'active' && 
          circle.createdBy !== currentUser.uid
        );
        
        console.log(`Found ${publicCirclesFromOthers.length} public circles from other users`);
        
        // Sort by creation date (newest first)
        const sortedCircles = publicCirclesFromOthers.sort((a, b) => 
          b.createdAt.getTime() - a.createdAt.getTime()
        );
        
        setCircles(sortedCircles);
      } catch (err: any) {
        console.error('Error fetching circles:', err);
        setError(`Failed to load public circles: ${err.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPublicCircles();
  }, [currentUser]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Calculate progress percentage
  const calculateProgress = (current: number, goal: number) => {
    if (goal <= 0) return 0;
    const percentage = (current / goal) * 100;
    return Math.min(percentage, 100);
  };

  // Check if user is already a member of a circle
  const isUserMember = (circle: Circle) => {
    if (!currentUser || !circle.members) return false;
    return circle.members.includes(currentUser.uid);
  };

  // Handle joining a circle
  const handleJoinCircle = async (circleId: string) => {
    if (!currentUser) return;
    
    setJoiningCircle(circleId);
    setError('');
    
    try {
      await joinCircle(circleId, currentUser.uid);
      
      // Update local state to reflect membership
      setCircles(prevCircles => 
        prevCircles.map(circle => {
          if (circle.id === circleId) {
            const updatedMembers = [...(circle.members || [])];
            if (!updatedMembers.includes(currentUser.uid)) {
              updatedMembers.push(currentUser.uid);
            }
            return { ...circle, members: updatedMembers };
          }
          return circle;
        })
      );
    } catch (err: any) {
      console.error('Error joining circle:', err);
      setError('Failed to join circle. Please try again.');
    } finally {
      setJoiningCircle(null);
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
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Discover Circles</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Find and join public investment circles created by other users
                </p>
              </div>
              <Link href="/dashboard/circles">
                <Button variant="outline" size="sm" className="mt-4 sm:mt-0">
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    My Circles
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
            ) : circles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {circles.map(circle => (
                  <motion.div
                    key={circle.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="h-full flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-semibold">{circle.name}</h3>
                        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          Public
                        </span>
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
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {circle.members?.length || 0} members
                        </span>
                        
                        {isUserMember(circle) ? (
                          <span className="text-sm font-medium text-green-600 dark:text-green-400 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Joined
                          </span>
                        ) : (
                          <div className="flex space-x-2">
                            <Link href={`/dashboard/circles/${circle.id}`}>
                              <Button variant="outline" size="sm">
                                Details
                              </Button>
                            </Link>
                            <Button 
                              size="sm"
                              onClick={() => handleJoinCircle(circle.id as string)}
                              disabled={joiningCircle === circle.id}
                            >
                              {joiningCircle === circle.id ? 'Joining...' : 'Join'}
                            </Button>
                          </div>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card>
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">No public circles from other users available at the moment.</p>
                  <Link href="/dashboard/circles/create">
                    <Button>Create Your Own Circle</Button>
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