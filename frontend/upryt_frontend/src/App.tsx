import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Register from './pages/Register.tsx'
import Homepage from './pages/Homepage.tsx'
import Login from './pages/Login.tsx'
import ForgotPassword from './pages/forgotpassword.tsx'
import OtpForm from './pages/otpform.tsx'
import MainLayout from './components/MainLayout.tsx'
import { FeaturesSection } from './components/Feature.tsx'
import { Toaster } from 'sonner'
import About from './components/About.tsx'
import HeroSection from './components/HeroSection.tsx'


const App = () => {
  return (
    <div>
      <Router>
        <Routes>
          <Route element={<MainLayout />}>
            <Route index path='/' element={<Homepage />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgotpassword" element={<ForgotPassword />} />
            <Route path="/otpform" element={<OtpForm />} />
            <Route path="/features" element={<FeaturesSection />} />
            <Route path="/about" element={<About />} />
            <Route path="/herosection" element={<HeroSection />} />

            
          </Route>


          {/* <Route element={<adnublayout />}>
            <Route index element={<Homepage />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgotpassword" element={<ForgotPassword />} />
            <Route path="/otpform" element={<OtpForm />} />
          </Route> */}
        </Routes>
      </Router>
    </div>
  )
}

export default App
