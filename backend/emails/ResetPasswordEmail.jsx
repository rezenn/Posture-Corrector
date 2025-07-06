import React from 'react';
import { Html, Head, Preview, Body, Container, Text, Heading } from '@react-email/components';

export default function ResetPasswordEmail({ fullName, otp }) {
  return (
    <Html>
      <Head />
      <Preview>Password Reset OTP</Preview>
      <Body style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f5f5f5', padding: '20px' }}>
        <Container style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '8px' }}>
          <Heading>Hi {fullName},</Heading>
          <Text>Your password reset OTP is:</Text>
          <Text style={{ fontSize: '24px', fontWeight: 'bold' }}>{otp}</Text>
          <Text>This code is valid for 10 minutes.</Text>
          <Text>If you didn’t request a password reset, you can ignore this email.</Text>
        </Container>
      </Body>
    </Html>
  );
}
