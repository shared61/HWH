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
import { getCirclesByUser, getCirclesByMember } from '../../../lib/firebase/circles';

export default function CirclesPage() {
  const { currentUser } = useAuth();
  const [myCircles, setMyCircles] = useState<Circle[]>([]);
  const [joinedCircles, setJoinedCircles] = useState<Circle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCircles = async () => {
      if (!currentUser) return;
      
      setLoading(true);
      setError('');
      
      try {
        // Get circles created by the user
        const userCircles = await getCirclesByUser(currentUser.uid);
        setMyCircles(userCircles);
        
        // Get circles the user is a member of (but didn't create)
        const memberCircles = await getCirclesByMember(currentUser.uid);
        const filteredMemberCircles = memberCircles.filter(
          circle => circle.createdBy !== currentUser.uid
        );
        setJoinedCircles(filteredMemberCircles);
      } catch (err: any) {
        console.error('Error fetching circles:', err);
        setError('Failed to load circles. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCircles();
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

  // Render circle card
  const renderCircleCard = (circle: Circle) => (
    <Card key={circle.id} className="h-full flex flex-col">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold">{circle.name}</h3>
        <span className={`text-xs px-2 py-1 rounded-full ${
          circle.type === 'public' 
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
            : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
        }`}>
          {circle.type === 'public' ? 'Public' : 'Private'}
        </span>
      </div>
      
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 flex-grow">
        {circle.description.length > 100 
          ? `${circle.description.substring(0, 100)}...` 
          : circle.description}
      </p>
      
      <div className="space-y-2 mb-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Progress</span>
            <span>{formatCurrency(circle.currentAmount || 0)} of {formatCurrency(circle.goalAmount)}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${calculateProgress(circle.currentAmount || 0, circle.goalAmount)}%` }}
            ></div>
          </div>
        </div>
        
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Created: {formatDate(circle.createdAt)}</span>
          <span>{circle.members?.length || 1} members</span>
        </div>
      </div>
      
      <Link href={`/dashboard/circles/${circle.id}`}>
        <Button variant="outline" size="sm" fullWidth>
          View Details
        </Button>
      </Link>
    </Card>
  );

  return (
    <ProtectedRoute>
      <Layout>
        <div className="container mx-auto px-4 py-8 sm:py-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-6xl mx-auto"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold">Investment Circles</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Manage your investment circles and view your memberships
                </p>
              </div>
              <Link href="/dashboard/circles/create" className="mt-4 sm:mt-0">
                <Button>
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Circle
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
            ) : (
              <div className="space-y-10">
                {/* Circles created by the user */}
                <div>
                  <h2 className="text-xl font-semibold mb-4">My Circles</h2>
                  {myCircles.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {myCircles.map(renderCircleCard)}
                    </div>
                  ) : (
                    <Card>
                      <div className="text-center py-8">
                        <p className="text-gray-500 dark:text-gray-400 mb-4">You haven't created any investment circles yet.</p>
                        <Link href="/dashboard/circles/create">
                          <Button>Create Your First Circle</Button>
                        </Link>
                      </div>
                    </Card>
                  )}
                </div>

                {/* Circles the user has joined */}
                {joinedCircles.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Joined Circles</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {joinedCircles.map(renderCircleCard)}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
} 