"use client"
import React from 'react'
import { motion } from "framer-motion"
import Navbar from '../components/Navbar'
import GoodPosture from '../assets/goodposture.png'
import { Link } from "react-router-dom"

const Homepage = () => {
  return (
    <>
      <Navbar />
      <main className="h-screen w-full flex">
        {/* Left Half - Text */}
        <section className="w-1/2 flex items-center justify-center px-10 pt-10 relative z-10 bg-white">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-xl"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-blue-950 mb-4">
              Smart Posture for Everyday Wellness.
            </h1>
            <p className="text-gray-700 text-lg mb-6">
              Upryt helps you maintain perfect posture and focus, effortlessly.
              Start correcting your sitting habits with real-time AI monitoring.
            </p>
            <div className="flex space-x-10 mt-4">
              <Link to="/login">
                <button className="bg-blue-950 text-white hover:bg-blue-300 px-9 py-2 rounded-md text-l shadow cursor-pointer">
                  Get Started
                </button>
              </Link>
            </div>
          </motion.div>
        </section>
        {/* Right Half - Full Height Image */}
        <div className="w-1/2 h-screen relative">
          <img
            src={GoodPosture}
            alt="Upryt Illustration"
            className="h-full w-full object-cover object-center rounded-none"
          />
        </div>
      </main>
    </>
  )
}

export default Homepage
