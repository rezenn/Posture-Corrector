import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import UprytLogo from '../assets/uprytblue.png';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Smooth scroll helper
  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Check if current page is home (or landing page) so scrolling makes sense

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
          <Link to="/" aria-label="Go to homepage">
            <img
              src={UprytLogo}
              alt="Upryt Logo"
              className={`transition-all duration-300 ${scrolled ? "h-8" : "h-10"}`}
            />
          </Link>

          <div className="hidden md:flex space-x-8 text-lg font-medium text-blue-950 ml-6">
            {/* Home uses Link for full page navigation */}
            <Link to="/" className="hover:text-blue-300 transition-colors">
              Home
            </Link>

            {/* Scroll buttons only if on homepage; else fallback to home navigation */}
          
              <>
                <button
                  onClick={() => scrollToId("about")}
                  className="hover:text-blue-300 transition-colors"
                  aria-label="Scroll to About section"
                >
                  About
                </button>
                <button
                  onClick={() => scrollToId("features")}
                  className="hover:text-blue-300 transition-colors"
                  aria-label="Scroll to Features section"
                >
                  Features
                </button>
                <button
                  onClick={() => scrollToId("services")}
                  className="hover:text-blue-300 transition-colors"
                  aria-label="Scroll to Services section"
                >
                  Services
                </button>
              </>
         
          
         
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
