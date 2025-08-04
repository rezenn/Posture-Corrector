"use client"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Register from "./pages/Register.tsx"
import Homepage from "./pages/Homepage.tsx"
import Login from "./pages/Login.tsx"
import ForgotPassword from "./pages/forgotpassword.tsx"
import VerifyAccountRegistration from "./pages/VerifyAccountRegistration.tsx";
import VerifyAccountResetPassword from './pages/VerifyAccountResetPassword.tsx';
import ResetPassword from './pages/ResetPassword.tsx';
import OtpForm from './pages/otpform.tsx';
import MainLayout from './components/MainLayout.tsx';
import { FeaturesSection } from './pages/Feature.tsx';
import PostureChart from './pages/PostureChart.tsx';
import About from './components/About.tsx'
import HeroSection from './components/HeroSection.tsx'
import PostLoginHome from './pages/postloginhome.tsx';

const App = () => {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" index element={<Homepage />} />
          <Route path="/sign-up" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
          <Route path="/verify-account-registration/:username" element={<VerifyAccountRegistration />} />
          <Route path="/verify-account-reset-password/:email" element={<VerifyAccountResetPassword />} />
          <Route path="/reset-password/:email" element={<ResetPassword />} />
          <Route path="/about" element={<About />} />
          <Route path="/features" element={<FeaturesSection />} />
          <Route path="/herosection" element={<HeroSection />} />
          <Route path="/chart" element={<PostureChart />} />
        </Routes>
      </Router>
    </div>
  )
}

export default App
