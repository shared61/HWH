"use client";

import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase/firebase';
import Layout from '../../components/Layout';
import Card from '../../components/Card';

export default function TestPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching data from Firestore...");
        const circlesRef = collection(db, 'circles');
        const querySnapshot = await getDocs(circlesRef);
        
        console.log(`Retrieved ${querySnapshot.size} documents`);
        
        const documents: any[] = [];
        querySnapshot.forEach((doc) => {
          documents.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        setData(documents);
      } catch (err: any) {
        console.error("Error fetching data:", err);
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Firestore Test Page</h1>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
            <p>{error}</p>
          </div>
        )}
        
        {loading ? (
          <p>Loading data...</p>
        ) : data.length > 0 ? (
          <div className="space-y-4">
            <p>Found {data.length} documents in the circles collection:</p>
            
            {data.map(item => (
              <Card key={item.id}>
                <h2 className="text-lg font-semibold">{item.name || 'Unnamed'}</h2>
                <p className="text-sm text-gray-600">ID: {item.id}</p>
                <p className="text-sm text-gray-600">Type: {item.type || 'Unknown'}</p>
                <p className="text-sm text-gray-600">Status: {item.status || 'Unknown'}</p>
                <p className="text-sm text-gray-600">Created By: {item.createdBy || 'Unknown'}</p>
                <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                  {JSON.stringify(item, null, 2)}
                </pre>
              </Card>
            ))}
          </div>
        ) : (
          <p>No data found in the circles collection.</p>
        )}
      </div>
    </Layout>
  );
} 