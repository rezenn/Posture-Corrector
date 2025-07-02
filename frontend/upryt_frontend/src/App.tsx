import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Register from './pages/Register.tsx'
import Homepage from './pages/Homepage.tsx'
import Login from './pages/Login.tsx'
import ForgotPassword from './pages/forgotpassword.tsx'
<<<<<<< HEAD
=======
import OtpForm from './pages/otpform.tsx'
import MainLayout from './components/MainLayout.tsx'
=======
<<<<<<< HEAD
import ForgotPassword from './pages/forgotpassword.tsx'
=======
>>>>>>> 447e4c075acc178bff2968092fa0b0b8711573c7
import { Toaster } from 'sonner'

>>>>>>> 4a0eb85e25573af89d2fbd2b6541dbd6d52cc0fe

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
