import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Register from './pages/Register.tsx'
import Homepage from './pages/Homepage.tsx'
import Login from './pages/Login.tsx'
<<<<<<< HEAD
import ForgotPassword from './pages/forgotpassword.tsx'
import OtpForm from './pages/otpform.tsx'
import MainLayout from './components/MainLayout.tsx'
=======
<<<<<<< HEAD
import ForgotPassword from './pages/forgotpassword.tsx'
=======
import { Toaster } from 'sonner'
>>>>>>> 094152ca7ea9063617d31daa5b95f1eeab97dc5b

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
