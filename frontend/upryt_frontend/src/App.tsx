"use client"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Register from "./pages/Register.tsx"
import Homepage from "./pages/Homepage.tsx"
import Login from "./pages/Login.tsx"
import ForgotPassword from "./pages/forgotpassword.tsx"
import VerifyAccountRegistration from "./pages/VerifyAccountRegistration.tsx";
import VerifyAccountResetPassword from './pages/VerifyAccountResetPassword.tsx';

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
          <Route path="//reset-password/:email" element={<VerifyAccountResetPassword />} />
        </Routes>
      </Router>
    </div>
  )
}

export default App