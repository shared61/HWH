"use client";

import React, { useState, useEffect } from 'react';
import Layout from '../../../components/Layout';
import ProtectedRoute from '../../../components/ProtectedRoute';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import { useAuth } from '../../../context/AuthContext';
import { motion } from 'framer-motion';
import { getUserProfile, updateUserProfile } from '../../../lib/firebase/firestore';
import Link from 'next/link';

// Define the user profile type
interface UserProfile {
  id: string;
  displayName?: string;
  phoneNumber?: string;
  bio?: string;
  createdAt?: Date;
  updatedAt?: Date;
  [key: string]: any; // Allow for additional fields
}

export default function ProfilePage() {
  const { currentUser, updateUserProfile: updateAuthProfile } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (currentUser) {
        setLoading(true);
        try {
          // Set display name from auth
          if (currentUser.displayName) {
            setDisplayName(currentUser.displayName);
          }

          // Get additional profile data from Firestore
          const profile = await getUserProfile(currentUser.uid) as UserProfile;
          if (profile) {
            setPhoneNumber(profile.phoneNumber || '');
            setBio(profile.bio || '');
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setError('Failed to load profile data. Please try again later.');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserProfile();
  }, [currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      // Update auth profile
      if (currentUser) {
        await updateAuthProfile(displayName);
        
        // Update Firestore profile
        await updateUserProfile(currentUser.uid, {
          displayName,
          phoneNumber,
          bio,
          updatedAt: new Date()
        });
        
        setMessage('Profile updated successfully');
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setError(error.message || 'An error occurred while updating your profile');
    } finally {
      setSaving(false);
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
            className="max-w-2xl mx-auto"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <h1 className="text-3xl font-bold">Edit Profile</h1>
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Dashboard
                  </span>
                </Button>
              </Link>
            </div>

            <Card>
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="h-12 w-12 rounded-full border-t-4 border-b-4 border-blue-500"
                  />
                </div>
              ) : (
                <>
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md text-sm border-l-4 border-red-500"
                    >
                      {error}
                    </motion.div>
                  )}

                  {message && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-md text-sm border-l-4 border-green-500"
                    >
                      {message}
                    </motion.div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Email
                        </label>
                        <input
                          id="email"
                          type="email"
                          value={currentUser?.email || ''}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 bg-gray-100 dark:bg-gray-700"
                          disabled
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Email cannot be changed</p>
                      </div>

                      <div>
                        <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Display Name
                        </label>
                        <input
                          id="displayName"
                          type="text"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
                          required
                          disabled={saving}
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Phone Number
                      </label>
                      <input
                        id="phoneNumber"
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
                        disabled={saving}
                      />
                    </div>

                    <div>
                      <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Bio
                      </label>
                      <textarea
                        id="bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
                        disabled={saving}
                      ></textarea>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 pt-2">
                      <Link href="/dashboard">
                        <Button variant="outline" type="button" disabled={saving} fullWidth>
                          Cancel
                        </Button>
                      </Link>
                      <Button type="submit" disabled={saving} fullWidth>
                        {saving ? (
                          <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving...
                          </span>
                        ) : 'Save Changes'}
                      </Button>
                    </div>
                  </form>
                </>
              )}
            </Card>
          </motion.div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
} 