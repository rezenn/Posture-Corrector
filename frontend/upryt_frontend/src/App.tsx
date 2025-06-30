import React from 'react'
import { BrowserRouter as Router, Routes,Route } from 'react-router-dom'
import Register from './pages/Register.tsx'
import Homepage from './pages/Homepage.tsx'


const App = () => {
  return (
    <div >
      <Router>

      <Routes>
        
       
        <Route path='/' index element={<Homepage/>}/>
        <Route path='/register'element={<Register/>}/>
       

      </Routes>

      </Router>

    </div>
  )
}

export default App