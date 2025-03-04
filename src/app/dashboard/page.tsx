"use client";

import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import ProtectedRoute from '../../components/ProtectedRoute';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Circle } from '../../types/circle';
import { getCirclesByUser, getCirclesByMember } from '../../lib/firebase/circles';
import { getUserProfile } from '../../lib/firebase/firestore';

export default function DashboardPage() {
  const { currentUser, logout } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userCircles, setUserCircles] = useState<Circle[]>([]);
  const [memberCircles, setMemberCircles] = useState<Circle[]>([]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!currentUser) return;
      
      setLoading(true);
      setError('');
      
      try {
        const profile = await getUserProfile(currentUser.uid);
        setUserProfile(profile);
      } catch (err: any) {
        console.error('Error fetching user profile:', err);
        setError('Failed to load your profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [currentUser]);

  useEffect(() => {
    const fetchCircles = async () => {
      if (!currentUser) return;
      
      try {
        // Fetch circles created by the user
        const createdCircles = await getCirclesByUser(currentUser.uid);
        setUserCircles(createdCircles);
        
        // Fetch circles the user is a member of
        const joinedCircles = await getCirclesByMember(currentUser.uid);
        // Filter out circles the user created to avoid duplicates
        const filteredJoinedCircles = joinedCircles.filter(
          circle => circle.createdBy !== currentUser.uid
        );
        setMemberCircles(filteredJoinedCircles);
      } catch (err: any) {
        console.error('Error fetching circles:', err);
      }
    };
    
    fetchCircles();
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const formatDate = (dateString: any) => {
    if (!dateString) return '';
    
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

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

  // Render circle card
  const renderCircleCard = (circle: Circle) => (
    <Link 
      href={`/dashboard/circles/${circle.id}`} 
      key={circle.id}
      className="block"
    >
      <Card className="h-full hover:shadow-lg transition-shadow">
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
        
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
          {circle.description}
        </p>
        
        <div className="mt-auto">
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
      </Card>
    </Link>
  );

  return (
    <ProtectedRoute>
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
            
            {error && (
              <div className="mb-6 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md text-sm border-l-4 border-red-500">
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <Card title="Profile">
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-medium">{userProfile?.name || currentUser?.displayName || 'User'}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{currentUser?.email}</p>
                        </div>
                      </div>
                      
                      {userProfile?.bio && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Bio</h4>
                          <p>{userProfile.bio}</p>
                        </div>
                      )}
                      
                      {userProfile?.joinedAt && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Member Since</h4>
                          <p>{formatDate(userProfile.joinedAt)}</p>
                        </div>
                      )}
                      
                      <div className="pt-4 flex space-x-2">
                        <Link href="/dashboard/profile">
                          <Button variant="outline" size="sm">Edit Profile</Button>
                        </Link>
                        <Button variant="outline" size="sm" onClick={handleLogout}>Logout</Button>
                      </div>
                    </div>
                  )}
                </Card>
              </div>
              
              <div className="lg:col-span-2 space-y-6">
                {/* Circles you created */}
                <Card title="Your Investment Circles">
                  {userCircles.length > 0 ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {userCircles.slice(0, 2).map(renderCircleCard)}
                      </div>
                      <div className="flex justify-end">
                        <Link href="/dashboard/circles">
                          <Button variant="outline" size="sm">View All Circles</Button>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-gray-500 dark:text-gray-400 mb-4">You haven't created any investment circles yet.</p>
                      <Link href="/dashboard/circles/create">
                        <Button>Create Your First Circle</Button>
                      </Link>
                    </div>
                  )}
                </Card>
                
                {/* Circles you joined */}
                {memberCircles.length > 0 && (
                  <Card title="Circles You Joined">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {memberCircles.slice(0, 2).map(renderCircleCard)}
                      </div>
                      <div className="flex justify-end">
                        <Link href="/dashboard/circles">
                          <Button variant="outline" size="sm">View All</Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                )}
                
                {/* Quick actions */}
                <Card title="Quick Actions">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <Link href="/dashboard/circles/create" className="block">
                      <div className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 p-4 rounded-lg text-center transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto mb-2 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span className="text-sm font-medium">Create Circle</span>
                      </div>
                    </Link>
                    <Link href="/dashboard/circles" className="block">
                      <div className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 p-4 rounded-lg text-center transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto mb-2 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span className="text-sm font-medium">All Circles</span>
                      </div>
                    </Link>
                    <Link href="/dashboard/profile" className="block">
                      <div className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 p-4 rounded-lg text-center transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto mb-2 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="text-sm font-medium">Profile</span>
                      </div>
                    </Link>
                    <Link href="/settings" className="block">
                      <div className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 p-4 rounded-lg text-center transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto mb-2 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-sm font-medium">Settings</span>
                      </div>
                    </Link>
                  </div>
                </Card>
              </div>
            </div>
          </motion.div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
} 