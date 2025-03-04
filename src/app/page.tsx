"use client";

import Layout from "../components/Layout";
import Card from "../components/Card";
import Button from "../components/Button";
import { motion } from "framer-motion";

export default function Home() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <Layout>
      <section className="py-12">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome to Arvya Platform</h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              A modern web platform built with Next.js, Tailwind CSS, and Framer Motion.
            </p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <motion.div variants={item}>
              <Card title="Responsive Design" hoverable>
                <p className="mb-4">Fully responsive design that works perfectly on mobile, tablet, and desktop devices.</p>
                <Button variant="primary">Learn More</Button>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card title="Modern UI" hoverable>
                <p className="mb-4">Beautiful and modern UI with Tailwind CSS for styling and customization.</p>
                <Button variant="secondary">Explore</Button>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card title="Smooth Animations" hoverable>
                <p className="mb-4">Smooth animations powered by Framer Motion for an enhanced user experience.</p>
                <Button variant="outline">See Examples</Button>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="py-12 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Join thousands of users who are already using Arvya Platform for their projects.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg">Sign Up Now</Button>
              <Button variant="outline" size="lg">Learn More</Button>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
