import React from 'react'
import { BrowserRouter as Router, Routes,Route } from 'react-router-dom'
import Register from './pages/Register.tsx'
import Homepage from './pages/Homepage.tsx'
import Login from './pages/Login.tsx'
<<<<<<< HEAD
import ForgotPassword from './pages/forgotpassword.tsx'
=======
import { Toaster } from 'sonner'
>>>>>>> 094152ca7ea9063617d31daa5b95f1eeab97dc5b


const App = () => {
  return (
    <div >
      <Toaster/>
      <Router>

      <Routes>
        
       
        <Route path='/' index element={<Homepage/>}/>
        <Route path='/register'element={<Register/>}/>
        <Route path='/login'element={<Login/>}/>
        <Route path='/forgotpassword'element={<ForgotPassword/>}/>

      </Routes>

      </Router>

    </div>
  )
}

export default App