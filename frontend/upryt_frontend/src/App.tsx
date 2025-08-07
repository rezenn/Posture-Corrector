"use client"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Register from "./pages/Register.tsx"
import Homepage from "./pages/Homepage.tsx"
import Login from "./pages/Login.tsx"
import ForgotPassword from "./pages/forgotpassword.tsx"
import VerifyAccountRegistration from "./pages/VerifyAccountRegistration.tsx";
import VerifyAccountResetPassword from './pages/VerifyAccountResetPassword.tsx';
import ResetPassword from './pages/ResetPassword.tsx';
import { FeaturesSection } from './pages/Feature.tsx';
import PostureChart from './pages/PostureChart.tsx';
import About from './components/About.tsx';
import Dashboard from "./pages/Dashboard.tsx";
import PostureMonitoring from "./pages/PostureMonitoring.tsx";
import MyProfile from './pages/MyProfile.tsx';


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
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/analytics" element={<PostureChart />} />
          <Route path="/posturescan" element={<PostureMonitoring />} />
          <Route path="/my-profile" element={<MyProfile />} />
        </Routes>
      </Router>
    </div>
  )
}

export default App
