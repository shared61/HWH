"use client";

import React from 'react';
import Layout from '../../../../components/Layout';
import ProtectedRoute from '../../../../components/ProtectedRoute';
import Card from '../../../../components/Card';
import CircleForm from '../../../../components/CircleForm';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Button from '../../../../components/Button';

export default function CreateCirclePage() {
  return (
    <ProtectedRoute>
      <Layout>
        <div className="container mx-auto px-4 py-8 sm:py-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <h1 className="text-3xl font-bold">Create Investment Circle</h1>
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
            
            <Card>
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Create a New Investment Circle</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Fill out the form below to create a new investment circle. You'll be able to invite members and manage your circle after creation.
                </p>
              </div>
              
              <CircleForm />
            </Card>
          </motion.div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
} 