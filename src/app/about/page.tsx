"use client";

import Layout from "../../components/Layout";
import { motion } from "framer-motion";
import Card from "../../components/Card";

export default function About() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-4xl font-bold mb-6 text-center">About Arvya Platform</h1>
          
          <Card className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Arvya Platform is dedicated to providing a modern, responsive, and user-friendly web experience. 
              Our mission is to create a platform that empowers users to build and deploy applications with ease.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              Built with the latest technologies including Next.js, Tailwind CSS, and Framer Motion, 
              Arvya Platform offers a seamless experience across all devices and screen sizes.
            </p>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card title="Our Values">
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                  <li>User-centered design</li>
                  <li>Performance and accessibility</li>
                  <li>Continuous improvement</li>
                  <li>Open collaboration</li>
                  <li>Innovation and creativity</li>
                </ul>
              </Card>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card title="Our Team">
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Our team consists of passionate developers, designers, and product managers 
                  who are committed to creating the best possible experience for our users.
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  We believe in collaboration, transparency, and continuous learning.
                </p>
              </Card>
            </motion.div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Card title="Our Technology Stack">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <h3 className="font-semibold">Next.js</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">React Framework</p>
                </div>
                <div className="text-center p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <h3 className="font-semibold">Tailwind CSS</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Styling</p>
                </div>
                <div className="text-center p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <h3 className="font-semibold">Framer Motion</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Animations</p>
                </div>
                <div className="text-center p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <h3 className="font-semibold">TypeScript</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Type Safety</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </Layout>
  );
} 