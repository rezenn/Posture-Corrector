import React from 'react'
import HeroSection from '../components/HeroSection'
import { FeaturesSection } from '../components/Feature'
import About from '../components/About'
import Services from '../components/Services'

const Homepage = () => {
  return (
    <div>
      <HeroSection/>
      <About/>
      <FeaturesSection/>
      <Services/>
    </div>
  )
}

export default Homepage