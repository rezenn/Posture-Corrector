import * as React from 'react';

export default function ResetPasswordEmail({ fullName, otp }) {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', lineHeight: '1.6' }}>
      <h2>Hello {fullName},</h2>
      <p>You requested to reset your password.</p>
      <p>Your OTP code is:</p>
      <h1 style={{ color: '#4CAF50' }}>{otp}</h1>
      <p>This code is valid for 10 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
      <br />
      <p>Best regards,<br />The UPRYT Team</p>
    </div>
  );
}
