import React from 'react'
import HeroSection from '../components/HeroSection'
import { FeaturesSection } from '../components/Feature'
import About from '../components/About'
import Pricing from '../components/Pricing'

const Homepage = () => {
  return (
    <div>
      <HeroSection/>
      <About/>
      <FeaturesSection/>
      <Pricing/>
    </div>
  )
}

export default Homepage