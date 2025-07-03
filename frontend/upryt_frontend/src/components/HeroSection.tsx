import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from "framer-motion"
import Navbar from '../components/Navbar'
import GoodPosture1 from '../assets/goodposture.png'
import GoodPosture2 from '../assets/Uprytmission.png'
import GoodPosture3 from '../assets/Goodposturespine.png'

const images = [GoodPosture1, GoodPosture2, GoodPosture3]

const HeroSection = () => {
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(1)
  const [firstRender, setFirstRender] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setDirection(1)
      setIndex((prev) => (prev + 1) % images.length)
      setFirstRender(false)
    }, 2000) // Change image every 2 seconds

    return () => clearInterval(interval)
  }, [])

  const slideVariants = {
    enter: (dir: number) => ({
      x: firstRender ? 0 : dir > 0 ? 300 : -300,
      opacity: firstRender ? 1 : 0
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" as const }
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -300 : 300,
      opacity: 0,
      transition: { duration: 0.6, ease: "easeIn" as const }
    })
  }

  return (
    <>
      <Navbar />
      <main id="herosection" className="h-screen w-full flex">
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
              <button className="bg-blue-950 text-white hover:bg-blue-300 px-9 py-2 rounded-md text-l shadow">
                Get Started
              </button>
            </div>
          </motion.div>
        </section>

        {/* Right Half - Image Slideshow */}
        <div className="w-1/2 h-screen relative overflow-hidden">
          <AnimatePresence custom={direction}>
            <motion.img
              key={index}
              src={images[index]}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute h-full w-full object-cover object-center"
            />
          </AnimatePresence>
        </div>
      </main>
    </>
  )
}

export default HeroSection
