import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
   host: 'smtp.gmail.com',
  port: 587,
  secure: false, // use TLS
  auth: {
    user: 'upryt007@gmail.com',       // replace with your Gmail
    pass: 'niqkplaxqnomnhjy'           // use App Password if 2FA enabled
  }
});

const mailOptions = {
  from: 'upryt007@gmail.com',
  to: 'chaudharyyogesh658@example.com',
  subject: 'Test Email from Node.js (ES Module)',
  text: 'Hello! This is a test email sent using Node.js with ES Modules.'
};

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    return console.log('❌ Error:', error);
  }
  console.log('✅ Email sent:', info.response);
});

