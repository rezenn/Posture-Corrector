import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import Register from './pages/testRegister.tsx'
import { GoogleOAuthProvider } from '@react-oauth/google';
import LoginPage from './pages/Login.tsx'
createRoot(document.getElementById('root')!).render(
  <StrictMode>
     <GoogleOAuthProvider clientId="">
    <LoginPage />
  </GoogleOAuthProvider>
  </StrictMode>,
)
