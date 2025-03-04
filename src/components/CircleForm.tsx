"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Button from './Button';
import { useAuth } from '../context/AuthContext';
import { CircleFormData } from '../types/circle';
import { createCircle } from '../lib/firebase/circles';

interface CircleFormProps {
  onSuccess?: (circleId: string) => void;
}

const CircleForm: React.FC<CircleFormProps> = ({ onSuccess }) => {
  const { currentUser } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState<CircleFormData>({
    name: '',
    description: '',
    goalAmount: 0,
    type: 'public',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Circle name is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }
    
    if (!formData.goalAmount || formData.goalAmount <= 0) {
      newErrors.goalAmount = 'Goal amount must be greater than 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'goalAmount' ? parseFloat(value) || 0 : value
    }));
    
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      setError('You must be logged in to create a circle');
      return;
    }
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const circleId = await createCircle({
        ...formData,
        createdBy: currentUser.uid,
      });
      
      setSuccess(true);
      setFormData({
        name: '',
        description: '',
        goalAmount: 0,
        type: 'public',
      });
      
      if (onSuccess) {
        onSuccess(circleId);
      } else {
        // Redirect to the circle page after a short delay
        setTimeout(() => {
          router.push(`/dashboard/circles/${circleId}`);
        }, 1500);
      }
    } catch (err: any) {
      console.error('Error creating circle:', err);
      setError(err.message || 'Failed to create circle. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      {error && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md text-sm border-l-4 border-red-500"
        >
          {error}
        </motion.div>
      )}
      
      {success && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-md text-sm border-l-4 border-green-500"
        >
          Circle created successfully!
        </motion.div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Circle Name*
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-4 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800`}
            placeholder="Enter circle name"
            disabled={loading}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description*
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className={`w-full px-4 py-2 border ${errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800`}
            placeholder="Describe the purpose of this investment circle"
            disabled={loading}
          ></textarea>
          {errors.description && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="goalAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Goal Amount*
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 dark:text-gray-400">$</span>
              </div>
              <input
                id="goalAmount"
                name="goalAmount"
                type="number"
                min="0"
                step="0.01"
                value={formData.goalAmount || ''}
                onChange={handleChange}
                className={`w-full pl-8 pr-4 py-2 border ${errors.goalAmount ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800`}
                placeholder="0.00"
                disabled={loading}
              />
            </div>
            {errors.goalAmount && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.goalAmount}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Circle Type*
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
              disabled={loading}
            >
              <option value="public">Public (Anyone can join)</option>
              <option value="private">Private (Invitation only)</option>
            </select>
          </div>
        </div>
        
        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={loading}>
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Circle...
              </span>
            ) : 'Create Circle'}
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default CircleForm; 