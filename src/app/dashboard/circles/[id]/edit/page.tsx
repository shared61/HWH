"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '../../../../../components/Layout';
import ProtectedRoute from '../../../../../components/ProtectedRoute';
import Card from '../../../../../components/Card';
import Button from '../../../../../components/Button';
import { useAuth } from '../../../../../context/AuthContext';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Circle, CircleFormData } from '../../../../../types/circle';
import { getCircleById, updateCircle } from '../../../../../lib/firebase/circles';

export default function EditCirclePage() {
  const { id } = useParams();
  const router = useRouter();
  const { currentUser } = useAuth();
  const [circle, setCircle] = useState<Circle | null>(null);
  const [formData, setFormData] = useState<CircleFormData>({
    name: '',
    description: '',
    goalAmount: 0,
    type: 'public'
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState('');

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
        
        // Check if user is the creator
        if (circleData.createdBy !== currentUser.uid) {
          setError('You do not have permission to edit this circle');
          return;
        }
        
        setCircle(circleData);
        setFormData({
          name: circleData.name,
          description: circleData.description,
          goalAmount: circleData.goalAmount,
          type: circleData.type
        });
      } catch (err: any) {
        console.error('Error fetching circle:', err);
        setError('Failed to load circle details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCircle();
  }, [currentUser, id]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Circle name is required';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }
    
    if (!formData.goalAmount || formData.goalAmount <= 0) {
      errors.goalAmount = 'Goal amount must be greater than 0';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'goalAmount' ? parseFloat(value) || 0 : value
    }));
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !currentUser || !circle || !circle.id) {
      return;
    }
    
    setSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      await updateCircle(circle.id, {
        ...formData,
        updatedAt: new Date()
      });
      
      setSuccess('Circle updated successfully!');
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push(`/dashboard/circles/${circle.id}`);
      }, 1500);
    } catch (err: any) {
      console.error('Error updating circle:', err);
      setError(err.message || 'Failed to update circle. Please try again.');
    } finally {
      setSubmitting(false);
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
              <h1 className="text-2xl font-bold mb-4 sm:mb-0">Edit Investment Circle</h1>
              <Link href={circle ? `/dashboard/circles/${circle.id}` : '/dashboard/circles'}>
                <Button variant="outline" size="sm">
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back
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

            {success && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-6 p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-md text-sm border-l-4 border-green-500"
              >
                {success}
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
              <Card>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-1">
                      Circle Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 ${
                        formErrors.name ? 'border-red-500 dark:border-red-500' : ''
                      }`}
                    />
                    {formErrors.name && (
                      <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium mb-1">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={4}
                      className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 ${
                        formErrors.description ? 'border-red-500 dark:border-red-500' : ''
                      }`}
                    />
                    {formErrors.description && (
                      <p className="mt-1 text-sm text-red-500">{formErrors.description}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="goalAmount" className="block text-sm font-medium mb-1">
                      Goal Amount ($)
                    </label>
                    <input
                      type="number"
                      id="goalAmount"
                      name="goalAmount"
                      value={formData.goalAmount}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 ${
                        formErrors.goalAmount ? 'border-red-500 dark:border-red-500' : ''
                      }`}
                    />
                    {formErrors.goalAmount && (
                      <p className="mt-1 text-sm text-red-500">{formErrors.goalAmount}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="type" className="block text-sm font-medium mb-1">
                      Circle Type
                    </label>
                    <select
                      id="type"
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
                    >
                      <option value="public">Public</option>
                      <option value="private">Private</option>
                    </select>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button
                      type="submit"
                      disabled={submitting}
                    >
                      {submitting ? 'Updating...' : 'Update Circle'}
                    </Button>
                  </div>
                </form>
              </Card>
            ) : (
              <Card>
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">Circle not found or you don't have permission to edit it.</p>
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