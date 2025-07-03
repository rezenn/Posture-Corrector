import React, { useEffect, useState } from "react"
import UprytLogo from '../assets/uprytblue.png'

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
  className={`
    fixed top-0 w-full z-50 transition-all duration-300
    ${scrolled ? "bg-white/80 shadow-md backdrop-blur h-14" : "bg-transparent h-20"}
  `}
>

    <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
      {/* Left Side: Logo & Links */}
      <div className="flex items-center w-1/2 space-x-10 ml-6">
        <img
          src={UprytLogo}
          alt="Upryt Logo"
          className={`transition-all duration-300 ${scrolled ? "h-8" : "h-10"}`}
        />
        <div className="hidden md:flex space-x-8 text-l font-medium text-blue-950 ml-6">
          <a href="#herosection" className="hover:text-blue-300 transition-colors">Home</a>
          <a href="#about" className="hover:text-blue-300 transition-colors">About</a>
          <a href="#features" className="hover:text-blue-300 transition-colors">Features</a>
          <a href="#services" className="hover:text-blue-300 transition-colors">Pricing</a>
        </div>      </div>
    </nav>
    </header>
  )
}

export default Navbar
