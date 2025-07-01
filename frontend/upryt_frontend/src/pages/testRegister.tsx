// frontend/pages/Register.tsx
import React from 'react';
import { render } from '@react-email/render'; // ✅ Correct rendering method
import VerificationEmail from '../emails/VerificationEmail'; // ✅ Your email component
import axios from 'axios';

export default function Register() {
  const sendEmail = async () => {
    try {
      const html = await render(
        <VerificationEmail fullName="Yogesh" otp="123456" />
      ); // ✅ Convert JSX to raw HTML

      console.log("📨 Rendered HTML:\n", html); // ✅ Preview HTML in browser console

      await axios.post(
        'http://localhost:3000/api/users/send-verification',
        {
          email: 'chaudharyyogesh658@gmail.com',
          html:html,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      alert('✅ Verification email sent!');
    } catch (error) {
      console.error('❌ Email failed:', error);
      alert('❌ Failed to send verification email');
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Register</h1>
      <button
        onClick={sendEmail}
        style={{
          padding: '10px 20px',
          backgroundColor: '#0070f3',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        Send Verification Email
      </button>
    </div>
  );
}
